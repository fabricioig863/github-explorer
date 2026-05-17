# GitHub Explorer

Aplicativo React Native (Expo SDK 54, RN 0.81, TypeScript strict) que
consome a API pública do GitHub para explorar repositórios, suas issues
abertas e o perfil do usuário configurado. Foi construído como exercício
prático de **Clean Architecture em quatro camadas**, com a regra de
dependência travada por ESLint, cobertura de testes ≥ 80 % global
(domain e application em 100 %), tema light/dark, busca com debounce,
paginação infinita e tratamento tipado de erros.

> Documentação detalhada por arquivo em
> [`docs/PROJETO.md`](./docs/PROJETO.md). Este README é o ponto de entrada
> conceitual.

---

## Sumário

1. [Sobre o projeto](#1-sobre-o-projeto)
2. [Decisões arquiteturais e o porquê](#2-decisões-arquiteturais-e-o-porquê)
3. [Clean Architecture, camada por camada](#3-clean-architecture-camada-por-camada)
4. [Como as camadas se conectam](#4-como-as-camadas-se-conectam)
5. [Valor desse desenho no dia a dia](#5-valor-desse-desenho-no-dia-a-dia)
6. [Como rodar](#6-como-rodar)
7. [Scripts e thresholds](#7-scripts-e-thresholds)
8. [O que faria diferente com mais tempo](#8-o-que-faria-diferente-com-mais-tempo)

---

## 1. Sobre o projeto

O app oferece quatro telas conectadas a endpoints públicos do GitHub:

| Tela           | Endpoint                                           | Função                                                                        |
| -------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| Search         | `GET /search/repositories`                         | Busca paginada com debounce de 300 ms e EmptyState path-aware                 |
| RepoDetail     | `GET /repos/{owner}/{repo}` + `GET /search/issues` | Hero, stats, linguagem e contagem **real** de issues abertas (sem PRs)        |
| Issues         | `GET /search/issues`                               | Lista paginada de issues abertas com filtro `type:issue`                      |
| Profile ("Me") | `GET /users/{username}` + `GET /users/{u}/events`  | Hero, contribuições, commits recentes (toggle "Ver todos"/"Ver menos") e tema |

Pontos não-óbvios incorporados no caminho:

- **Busca enriquecida** (`buildSearchQuery`): termos no formato `owner/repo`
  viram `q=repo:owner/name`; termos livres ganham `in:name,description`
  para filtrar README do escopo (ruído clássico do `/search/repositories`).
- **Issues sem PRs**: o endpoint `/repos/{owner}/{repo}/issues` mistura
  pull requests com issues. Usamos `/search/issues` + `type:issue` para
  garantir lista limpa. `hasNextPage` é matemático (`page * perPage < total_count`).
- **Erros tipados**: nenhuma `AxiosError` cruza a fronteira da infra.
  Tudo vira `DomainError` (`NetworkError`, `RateLimitError`, `NotFoundError`,
  `InvalidQueryError`, `UnexpectedError`) com `code` discriminador.
- **Skeleton loaders animados** em todas as telas que esperam rede.
- **Banner de rate limit** com `resetAt` formatado em pt-BR via `date-fns`.

---

## 2. Decisões arquiteturais e o porquê

### 2.1. Clean Architecture em quatro camadas

**Decisão:** organizar o código em `domain → application → infra → presentation`,
com a seta de dependência apontando sempre para dentro.

**Porquê:** o desafio testa não só "fazer funcionar" mas **a clareza da
separação de responsabilidades**. Misturar fetch + regra + UI no mesmo
arquivo passaria nos testes manuais e morreria no longo prazo. Com as
camadas separadas:

- Posso trocar `axios` por `fetch` sem que `Repository.ts` perceba.
- Posso adicionar uma nova vertical (Profile) sem tocar em Search.
- Posso testar regra de negócio sem subir React Native.

A regra de dependência é **executada**, não documentada: `eslint-plugin-boundaries`
quebra o build se alguém importar `axios` dentro de `application/` ou
`react-native` dentro de `domain/`.

### 2.2. Inversão de dependência via interfaces no domain

**Decisão:** o `domain` declara contratos (`IRepoRepository`, `IIssueRepository`,
`IUserRepository`); a implementação concreta vive em `infra`; o use case
recebe a interface por construtor.

**Porquê:** isso é o que torna a troca de mock por HTTP real possível em
**um único arquivo** (`src/infra/di/container.ts`):

```ts
function buildRepoRepository(): IRepoRepository {
  if (USE_MOCK) return new InMemoryRepoRepository();
  return new GitHubRepoRepository();
}
```

Use case não sabe (e não precisa saber) qual veio. Esse princípio também
torna **testes baratos**: fakes em `__tests__/test-utils/fakes/` são
classes de 20 linhas que implementam a mesma interface com `jest.fn()`.

### 2.3. React Query como cache da infra, não como state manager

**Decisão:** `@tanstack/react-query` mora em `presentation/hooks` (camada
de adaptação), nunca em `application` ou `domain`. Não temos Redux,
Zustand, Recoil.

**Porquê:** React Query resolve **cache de servidor**, que é um problema
de infra, não de domínio. Estado puramente local (form, toggle de tema)
vive em `useState`. Isso evita inflação de bibliotecas e mantém o
domínio agnóstico de framework.

`queryClient` tem:

- `staleTime: 5 min` (cache acessível sem refetch).
- `gcTime: 30 s` (memória liberada 30 s após o último consumer).
- `refetchOnWindowFocus: false` (padrão desktop ruim para mobile).
- `retry: shouldRetry` (erros determinísticos como `RateLimit` e
  `NotFound` **não retentam** — não tem motivo para queimar rate limit).

### 2.4. DTO + Mapper na fronteira HTTP

**Decisão:** todo dado vindo da API é tipado em `infra/http/dtos/*Dto.ts`
(shape **bruto** snake_case) e traduzido por `infra/http/mappers/*.ts`
para a `Entity` do domain (camelCase, com `Date` instanciado, com
`null` modelado explicitamente).

**Porquê:** quando o GitHub mudar a API (REST → GraphQL, ou outra
versão), mexemos só em `dtos/` e `mappers/`. O domain não percebe.
Bonus: `description: null` no DTO **propaga** para a entity (não
convertemos para string vazia silenciosamente). Isso força a UI a
lidar com ausência (`{repo.description !== null && ...}`).

### 2.5. Erros tipados com `code` discriminador

**Decisão:** `DomainError` é classe abstrata. Cada subclasse declara
`readonly code = 'NETWORK_ERROR' as const`.

**Porquê:** permite `switch (err.code)` exaustivo no TypeScript e o
util `getErrorMessage` casa com `instanceof` para devolver string
pt-BR. `mapHttpError` na infra **sempre lança** (retorno `never`), o
que dá ao TS narrowing total no `try/catch`.

### 2.6. Restyle para tema tipado

**Decisão:** `@shopify/restyle` em vez de StyleSheet cru ou styled-components.

**Porquê:** Restyle tipa o tema (cores, spacing, variants) no
TypeScript. Trocar `color="fg"` por `color="fgz"` é erro de compilação,
não tela vermelha em runtime. Light/dark é só trocar o objeto
`theme` que o provider exporta.

### 2.7. Composition Root único

**Decisão:** todo `new GitHubXRepository()` mora em
`src/infra/di/container.ts`. Nenhum hook nem screen instancia repositório
direto.

**Porquê:** o "lugar onde os concretos viram visíveis ao mundo" é
**um único arquivo**. Mock vs HTTP real é uma `if` lá. Testes substituem
o container inteiro com `jest.mock('src/infra/di/container', ...)`.

### 2.8. ESLint boundaries enforcing as regras

**Decisão:** `eslint-plugin-boundaries` mapeia `src/domain`,
`src/application`, `src/infra`, `src/presentation` para "tipos" e proíbe
imports cruzando para fora.

**Porquê:** uma regra documentada que não é executada é só boa intenção.
Com o lint, qualquer PR que importar `axios` no domain quebra no CI.

---

## 3. Clean Architecture, camada por camada

```
src/
├── domain/             puro. Zero dependências externas.
├── application/        orquestra o domain. Só importa @/domain.
├── infra/              adapters concretos. Importa domain + application.
└── presentation/       UI. Pode importar tudo abaixo.
```

A seta da dependência aponta **sempre para dentro**.

### 3.1. Domain — vocabulário do negócio

**O que mora aqui:**

- `entities/` — `Repository`, `Issue`, `Owner`, `Label`, `UserProfile`,
  `RecentCommit`. Apenas `interface` (são _dados_, não comportamento).
- `repositories/` — contratos `IRepoRepository`, `IIssueRepository`,
  `IUserRepository` + tipo genérico `PaginatedResult<T>`.
- `errors/` — `DomainError` (abstrata) e cinco subclasses.

**O que NÃO mora aqui:** axios, React, RN, AsyncStorage, restyle,
date-fns. Nada externo. `grep -rE "^import" src/domain/ | grep -v "@/domain"`
devolve vazio.

**Por que é a camada mais importante:** se trocarmos a plataforma
(web, CLI, server), o domain vai inteiro. É o que descreve o **negócio**,
não o **meio**.

### 3.2. Application — regra de uso

**O que mora aqui:**

Seis use cases, um por operação de negócio:

- `SearchReposUseCase` — sanitiza, valida (≥ 2 chars), aplica
  `perPage = 20`, delega.
- `GetRepoDetailsUseCase` — valida owner/repo, delega.
- `ListIssuesUseCase` — defaults `state = 'open'`, `perPage = 20`.
- `CountOpenIssuesUseCase` — separado da listagem porque
  `RepoDetailScreen` só precisa do número.
- `GetUserProfileUseCase`, `GetRecentCommitsUseCase` — análogos.

Cada use case recebe a interface do repositório por **construtor**.
Não sabe se a implementação é axios ou in-memory.

**O que NÃO mora aqui:** detalhes de HTTP, de UI, de React. O use case
não trata erro do repositório — erros já são `DomainError` quando
chegam, então sobem intactos para a presentation.

**Por que essa camada existe:** regras como "trim antes de validar",
"vazio é inválido", "perPage default é 20" precisam morar em **um
lugar verificável por teste**. Botá-las no hook deixa o teste preso
a React; botá-las no repositório mistura "regra de uso" com
"detalhe de HTTP". O use case é o meio termo.

### 3.3. Infra — adapters concretos

**O que mora aqui:**

- `http/httpClient.ts` — axios singleton com `baseURL`,
  `Accept: application/vnd.github+json`, interceptor que injeta
  Bearer token quando `EXPO_PUBLIC_GITHUB_TOKEN` está setado.
- `http/errorMapper.ts` — `mapHttpError(err, ctx): never` traduz
  `AxiosError` para `DomainError`. Detecta rate limit por status 429
  **ou** status 403 + header `x-ratelimit-remaining=0`.
- `http/dtos/`, `http/mappers/` — shapes brutos e tradutores DTO→Entity.
- `repositories/GitHubXRepository.ts` — implementações HTTP reais.
- `repositories/InMemoryXRepository.ts` + `fixtures/` — implementações
  mockadas para dev local sem queimar rate limit.
- `di/container.ts` — composition root.
- `theme/` — Restyle config (light/dark, fonts, tokens).
- `query/` — `QueryClient` + `QueryProvider`.

**O que NÃO mora aqui:** lógica de negócio (vive no application),
JSX (vive no presentation).

**Por que essa separação:** quando o GitHub mudar a API, mexemos só
aqui. Quando trocarmos axios por fetch, mexemos só aqui. Quando
adicionarmos cache offline, mexemos só aqui.

### 3.4. Presentation — UI

**O que mora aqui:**

- `screens/` — quatro telas com state machine
  `(queryHasMinLength ? loading ? error ? empty ? lista)`.
- `components/` — `RepoListItem`, `IssueListItem`, `EmptyState`,
  `RateLimitBanner` + sub-pacote `profile/` (`ProfileHero`, `CommitList`,
  `ContribCard`, `AvatarRing`, `ThemeToggleButton`).
- `design-system/` — primitives (`Box`, `Text`), componentes (`Button`,
  `Card`, `Input`, `Badge`, `Avatar`, `Skeleton`).
- `hooks/` — wrappers de React Query (`useSearchRepos`, `useRepoDetails`,
  `useIssues`, `useOpenIssuesCount`, `useProfileData`, `useRecentCommits`)
  - `useDebounce` genérico.
- `utils/` — funções puras (`getErrorMessage`, `getEmptySearchCopy`,
  `formatRelativeDate`).
- `navigation/` — `RootNavigator`, `TabsNavigator`, `ExploreStack`.

**Princípio:** hooks **adaptam** o use case ao ciclo de vida do React
Query. Não fazem validação própria — a do use case é a fonte da verdade.
`enabled` é só otimização (evitar request com query curta).

---

## 4. Como as camadas se conectam

Exemplo concreto: o usuário digita "react" no SearchScreen.

```
SearchScreen          useDebounce(300ms)
   ↓                      ↓
useSearchRepos    →   useInfiniteQuery
   ↓
container.searchReposUseCase.execute({ query, page, perPage })
   ↓
SearchReposUseCase
  ├─ sanitize: "  react  " → "react"
  ├─ validate: length ≥ 2 ✓
  └─ delegate to repository
        ↓
IRepoRepository (interface)
        ↓ resolvido em tempo de construção via DI
GitHubRepoRepository.search(...)         InMemoryRepoRepository.search(...)
  ├─ buildSearchQuery("react")              ├─ filtra fixtures
  │     → "react in:name,description"       └─ devolve PaginatedResult
  ├─ httpClient.get("/search/repositories", { q, sort, page, per_page })
  ├─ response.data.items.map(mapRepository)   // DTO → Entity
  └─ devolve PaginatedResult<Repository>
        ↓
       ou em caso de erro:
        ↓
       mapHttpError(err)
        ↓
       throw NetworkError | RateLimitError | NotFoundError | UnexpectedError
        ↑
        sobe direto pelo use case, pelo hook, até o `error` do React Query
        ↓
SearchScreen
  ├─ if (error instanceof RateLimitError) → RateLimitBanner com resetAt
  ├─ else → EmptyState com getErrorMessage(error)
  └─ ou lista de RepoListItem
```

Observe quem **não conhece** quem:

- `domain` não conhece `application`, `infra`, `presentation`.
- `application` não conhece `infra`, `presentation`. Só conhece o
  contrato no `domain`.
- `infra` não conhece `presentation`. Implementa o contrato do `domain`,
  pode usar utilities de `application` (raro).
- `presentation` conhece todas as anteriores.

O sentido é exatamente o oposto da invocação: **a dependência aponta
para dentro, mas a execução flui de fora para dentro e o resultado
flui de dentro para fora**.

---

## 5. Valor desse desenho no dia a dia

### 5.1. Substituição de implementação em um único ponto

Mock vs HTTP real é controlado por `EXPO_PUBLIC_USE_MOCK` em **uma
linha** do container. Use cases, hooks, screens, entities não percebem
a troca. Isso é a **prova viva** de que a abstração funcionou.

### 5.2. Adicionar uma nova vertical sem tocar nas existentes

A feature Profile validou o desenho:

1. Novo entity (`UserProfile`, `RecentCommit`) no domain.
2. Nova interface (`IUserRepository`) no domain.
3. Nova implementação (`GitHubUserRepository`) na infra.
4. Novos use cases (`GetUserProfileUseCase`, `GetRecentCommitsUseCase`).
5. Novos hooks, nova tela.

Zero acoplamento com Search ou Detail. Esse é o teste de fogo: se a
arquitetura permite adicionar uma vertical inteira sem tocar nas
anteriores, ela está funcionando.

### 5.3. Testes baratos por design

A pirâmide saiu naturalmente:

| Camada              | Estratégia                                | Cobertura |
| ------------------- | ----------------------------------------- | --------- |
| Domain              | Unit puro (construtor, `instanceof`)      | 100 %     |
| Application         | Unit com fake repository                  | 100 %     |
| Infra (mappers)     | Unit DTO → Entity                         | 100 %     |
| Infra (errorMapper) | Unit com `AxiosError` montado à mão       | 100 %     |
| Hooks               | `renderHook` + container mockado          | 100 %     |
| Components          | RNTL render + interação                   | ~95 %     |
| Screens             | RNTL render integrado + container mockado | ~85 %     |

171 testes em 38 suites rodam em ~4 s.

### 5.4. Manutenibilidade real, não retórica

Quando o GitHub passar a devolver issues com campo novo, mexo só no
DTO + mapper. Quando o time decidir adotar GraphQL, mexo só na infra.
Quando o produto pedir nova tela "favoritos", adiciono entity + use case +
hook + screen — zero refactor das existentes.

### 5.5. Onboarding mais curto

Um dev novo abre `docs/PROJETO.md`, lê 5 minutos, e sabe onde cada
coisa mora. O nome da pasta é honesto: regra mora em `application`,
HTTP mora em `infra`, JSX mora em `presentation`.

---

## 6. Como rodar

### Pré-requisitos

- Node 20+ e [pnpm](https://pnpm.io/) 10+.
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (vem via
  `pnpm` automaticamente).
- iOS Simulator (Xcode) ou Android Emulator (Android Studio) — opcional,
  funciona no Expo Go também.

### Setup

```bash
# 1. Clonar e instalar
pnpm install

# 2. Configurar variáveis (opcional)
cp .env.example .env
```

Edite `.env`:

| Variável                       | Default   | Função                                                        |
| ------------------------------ | --------- | ------------------------------------------------------------- |
| `EXPO_PUBLIC_USE_MOCK`         | `true`    | Quando `false`, consome a API real do GitHub                  |
| `EXPO_PUBLIC_GITHUB_TOKEN`     | (vazio)   | PAT com escopo `public_repo`. Sobe rate limit para 5000 req/h |
| `EXPO_PUBLIC_PROFILE_USERNAME` | `octocat` | Username exibido na aba Perfil                                |

> O token vai para o bundle JS (prefixo `EXPO_PUBLIC_`). Use **apenas
> escopos read-only** (`public_repo`).

### Rodar

```bash
pnpm ios       # iOS Simulator
pnpm android   # Android Emulator
pnpm start     # Metro + escolher device depois
pnpm web       # Web (Expo)
```

Em dispositivo físico: instale Expo Go, escaneie o QR Code que o
`pnpm start` imprime no terminal.

---

## 7. Scripts e thresholds

```bash
pnpm typecheck       # tsc --noEmit (zero erros)
pnpm lint            # eslint flat config (zero errors)
pnpm test            # jest (38 suites, 171 testes)
pnpm test:coverage   # jest --coverage com thresholds
pnpm test:watch      # jest watch mode
pnpm format          # prettier
```

Thresholds em `jest.config.js`:

- Global: 80 % statements / 75 % branches / 80 % functions / 80 % lines.
- `src/domain/`: 100 % nos quatro eixos.
- `src/application/`: 100 % (95 % branches por causa de `??` curtos).

Relatório HTML em `coverage/lcov-report/index.html` após
`pnpm test:coverage`.

### Estado atual do CI local

| Comando              | Resultado                                                |
| -------------------- | -------------------------------------------------------- |
| `pnpm typecheck`     | 0 erros                                                  |
| `pnpm lint`          | 0 errors, ~87 warnings (deprecation de boundaries v5→v6) |
| `pnpm test`          | 38/38 suites, 171/171 testes                             |
| `pnpm test:coverage` | Global ~92 %, domain 100 %, application 100 %            |

---

## 8. O que faria diferente com mais tempo

O escopo atual prioriza arquitetura, qualidade de código e cobertura
de testes unitários/integração. Com mais tempo, levaria o produto
para o nível seguinte nas frentes abaixo:

### 8.1. Autenticação OAuth (Google e Apple)

Hoje o app consome apenas endpoints públicos com um PAT opcional
embutido no bundle. Em produção, eu trocaria por um fluxo real de
login social:

- **Tela de Login** dedicada com botões "Continuar com Google" e
  "Continuar com Apple" (este último obrigatório nas guidelines da
  App Store quando há outros provedores).
- Integração via `expo-auth-session` + `expo-apple-authentication`
  com PKCE, sem client secret no bundle.
- Sessão persistida em `expo-secure-store` (Keychain/Keystore), nunca
  em `AsyncStorage`.
- Refresh token rotativo e `axios` interceptor de 401 → refresh →
  retry transparente.
- Logout que invalida `queryClient` e limpa o secure store.
- Nova camada `infra/auth/` com interface `IAuthRepository` no domain,
  preservando a regra de dependência.

### 8.2. Tela de Profile completa

A aba "Me" hoje é read-only e usa um username fixo via env. Com login,
ela vira hub do usuário autenticado:

- **Histórico de commits** paginado com filtro por repositório, agrupado
  por dia, com diff resumido (`+adds / -dels`) por commit.
- **Edição de perfil**: nome, bio, location, company, blog — com
  `PATCH /user` (requer scope `user`). Validação no use case
  (`UpdateUserProfileUseCase`), feedback otimista no React Query.
- **Estatísticas pessoais**: contribuições do ano (heatmap estilo
  GitHub), top linguagens, streak.
- **Repositórios próprios** com toggle público/privado.
- **Configurações** in-app: tema (já existe), idioma (pt-BR/en),
  preferências de cache, logout.
- Upload de avatar via `expo-image-picker` + endpoint adequado.

### 8.3. Testes End-to-End (Detox ou Maestro)

A pirâmide hoje termina em screen-level com container mockado. Falta
a ponta de cima: smoke real no device.

- **Maestro** como primeira escolha — YAML declarativo, baixo
  overhead de manutenção, roda em CI sem nativo built. Detox
  entraria se precisássemos de hooks mais finos no bridge RN.
- Fluxos cobertos no E2E:
  - Login Google → ver perfil → logout.
  - Buscar `react` → abrir detalhe → ver issues → voltar.
  - Trocar tema → estado persiste após reload.
  - Rate limit simulado → banner aparece com `resetAt`.
  - Modo offline → estados de erro consistentes.
- Pipeline: Maestro Cloud (ou self-hosted no GitHub Actions com
  emulador) rodando contra build de staging com `EXPO_PUBLIC_USE_MOCK=true`
  para isolar do rate limit.
- Cobertura E2E não substitui unit/integration; complementa o topo
  da pirâmide.

### 8.4. Outras melhorias que entrariam no roadmap

- **i18n** com `i18next` (hoje strings pt-BR estão hardcoded).
- **Acessibilidade auditada**: labels, roles, contraste WCAG AA,
  testes com TalkBack/VoiceOver.
- **Observabilidade**: Sentry para crash reporting + breadcrumbs,
  métricas de performance (`react-native-performance`).
- **Feature flags** (PostHog ou Statsig) para rollout gradual de
  Profile editing e auth.
- **Cache offline real** com persister do React Query
  (`@tanstack/query-async-storage-persister`) + estratégia
  stale-while-revalidate por tela.
- **CI completo**: workflow GitHub Actions com `typecheck`, `lint`,
  `test:coverage`, build EAS preview por PR, comentário do Maestro
  Cloud no PR.
- **Detalhe de Issue** com markdown renderer (`react-native-markdown-display`),
  comentários paginados, reactions.
- **Deep linking** (`expo-router` ou config plugin) para abrir
  `github-explorer://repo/facebook/react` direto.

A ordem real seria: OAuth → secure storage → Profile editing →
E2E cobrindo o fluxo autenticado → i18n → observabilidade → resto.
Cada item respeita a arquitetura já estabelecida: contrato no
domain, regra no application, adapter na infra, JSX na presentation.

---
