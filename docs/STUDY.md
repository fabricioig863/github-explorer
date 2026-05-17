# Estudo Técnico — `github-explorer` (Clean Architecture / React Native)

> Material de preparação para entrevista final. 30 perguntas, ancoradas no código real deste projeto.
> Stack: Expo SDK 54, RN 0.81, React 19, TypeScript estrito, TanStack Query v5, Restyle, Axios, AsyncStorage, Jest + RNTL.

## Sumário

- [Bloco 1 — Fundamentos de Clean Architecture (1-6)](#bloco-1--fundamentos-de-clean-architecture)
- [Bloco 2 — Camada de Domínio (7-11)](#bloco-2--camada-de-domínio)
- [Bloco 3 — Camada de Application / Use Cases (12-16)](#bloco-3--camada-de-application--use-cases)
- [Bloco 4 — Infraestrutura e Injeção de Dependência (17-21)](#bloco-4--infraestrutura-e-injeção-de-dependência)
- [Bloco 5 — Apresentação, Hooks e Cache (22-26)](#bloco-5--apresentação-hooks-e-cache)
- [Bloco 6 — Testes, Qualidade e Decisões Práticas (27-30)](#bloco-6--testes-qualidade-e-decisões-práticas)
- [Top 5 — perguntas mais prováveis de cair](#top-5--perguntas-mais-prováveis-de-cair)

---

## Bloco 1 — Fundamentos de Clean Architecture

### 1. O que é Clean Architecture e por que aplicá-la em um app React Native?

**Resposta:**
Clean Architecture é um conjunto de regras de organização que impõe **direção única de dependência**: camadas externas (UI, framework, banco, HTTP) dependem de camadas internas (regras de negócio), nunca o contrário. As camadas internas só conhecem **abstrações** (interfaces) das externas.

Em React Native, o ganho concreto é triplo:
1. **Sobrevivência ao churn da plataforma:** RN, Expo, libs de navegação e cache mudam de API com frequência. Se a regra de negócio depende dessas libs, cada upgrade vira refactor de domínio.
2. **Testabilidade fora do simulador:** lógica que não importa `react-native` roda em Node puro com Jest, sem `jest-expo` preset pesado.
3. **Substituibilidade:** trocar Axios por Fetch, AsyncStorage por MMKV, ou rodar uma versão "mock" do app sem backend real fica trivial — é o que o `EXPO_PUBLIC_USE_MOCK` faz aqui.

**Exemplo prático:**
No projeto, [`SearchReposUseCase`](../src/application/use-cases/SearchReposUseCase.ts) recebe `IRepoRepository` no construtor. Trocar entre `GitHubRepoRepository` (Axios) e `InMemoryRepoRepository` (fixtures locais) é uma linha no [`container.ts`](../src/infra/di/container.ts:22-25). A UI não percebe.

**Por que essa decisão no projeto:**
Mostra que sei distinguir "código que pertence ao produto" de "código que pertence ao framework". Em entrevista, isso sinaliza maturidade — sênior não confunde negócio com infraestrutura.

---

### 2. Por que separar `domain`, `application`, `presentation` e `infrastructure`? Quais os trade-offs?

**Resposta:**
Cada camada tem uma única razão para mudar:
- **`domain`** muda quando o **negócio** muda (regras de validação, entidades, erros conceituais).
- **`application`** muda quando o **fluxo de orquestração** muda (novo caso de uso, paginação diferente).
- **`infrastructure`** muda quando a **tecnologia** muda (de Axios pra Fetch, de AsyncStorage pra MMKV).
- **`presentation`** muda quando a **UX/UI** muda (componentes, navegação, estados visuais).

Trade-offs honestos:
- **Custo:** mais arquivos, indireção (DTO → mapper → entidade → use case → hook → tela). Para um CRUD trivial é overkill.
- **Curva:** dev novo no time leva um dia pra entender a regra de dependência.
- **Ganho:** muda muito antes de o app passar de uma dúzia de telas — testabilidade fica trivial e refactors ficam locais.

**Por que essa decisão no projeto:**
A separação é reforçada via [`eslint-plugin-boundaries`](../eslint.config.js:14-45) — é regra estática, não convenção verbal. Domínio nem permite importar libs externas (`boundaries/external` com `disallow: ['*']`). Mostra que sei usar **tooling como guard rail**, não só disciplina.

---

### 3. O que é a Regra de Dependência e como ela se manifesta no projeto?

**Resposta:**
**Regra de Dependência (Uncle Bob):** o código-fonte de uma camada interna nunca pode referenciar nada de uma camada externa. Operacionalmente: nas declarações `import`, as setas só apontam pra dentro.

No projeto, isso é verificado em três níveis:

1. **TypeScript** — alias `@/domain/*` resolve para `src/domain/`, e domínio só importa de si mesmo.
2. **ESLint** — `boundaries/element-types` quebra o build se `domain` tentar importar `infrastructure`/`presentation`/`application` ([eslint.config.js:26-45](../eslint.config.js#L26-L45)).
3. **`boundaries/external`** — `domain` e `application` têm `disallow: ['*']` para imports externos, impedindo até que alguém escreva `import axios from 'axios'` num use case.

**Exemplo prático:**
```ts
// src/application/use-cases/SearchReposUseCase.ts
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
// ↑ application depende de domain (OK, aponta pra dentro)

// O contrário NÃO compila:
// src/domain/entities/Repository.ts
// import { GitHubRepoRepository } from 'src/infra/...' ← ESLint quebra
```

**Por que essa decisão no projeto:**
Provo que entendo a diferença entre **regra escrita no README** e **regra impossível de violar acidentalmente**. Lint é a versão executável da arquitetura.

---

### 4. Diferença entre Clean Architecture, Hexagonal e Onion — e por que a escolha desta?

**Resposta:**
As três compartilham o **princípio de inversão de dependência**, diferem em vocabulário e ênfase:

- **Hexagonal (Ports & Adapters, Cockburn):** foca em **portas** (interfaces de entrada/saída) e **adaptadores** (implementações). Não prescreve número de camadas — pode ser flat com domínio no centro e adaptadores nas bordas.
- **Onion (Palermo):** três círculos concêntricos (domain → application → infrastructure), explicita que **application services** ficam fora do domínio puro.
- **Clean (Uncle Bob):** consolida ambas com mais granularidade — Entities, Use Cases, Interface Adapters, Frameworks. Define a regra de dependência como invariante e adiciona o conceito de **DTOs/Mappers** explícitos na borda.

No projeto adotei Clean Architecture porque:
1. Já tenho **DTOs** (`RepositoryDto`) separados de **entidades** (`Repository`) — Clean dá nome a isso (Interface Adapter).
2. **Use cases** explícitos como classes (`SearchReposUseCase`) — vocabulário direto de Clean.
3. A literatura de RN tem mais exemplos de Clean do que Onion pura.

Não é dogma — Hexagonal teria entregue o mesmo resultado. Escolhi Clean porque o time-leitor reconhece o vocabulário mais rápido.

**Por que essa decisão no projeto:**
Mostra que **não decoro arquitetura**, comparo trade-offs. Entrevistador sênior valoriza quem escolhe com critério.

---

### 5. Como Clean Architecture facilita testabilidade? Por que isso importa em mobile?

**Resposta:**
Testabilidade vem de **dependências invertidas**: o use case recebe a interface, e o teste passa um fake. Sem mock de Axios, sem polyfill de AsyncStorage, sem montar QueryClient.

Mobile amplifica o ganho porque:
1. **Simulator/emulator é lento** — rodar 200 testes E2E não escala.
2. **Stack nativa é frágil em CI** — `jest-expo` puxa transformações pesadas; rodar em Node puro com fake repository é segundos vs. minutos.
3. **Estados difíceis de reproduzir** — rate limit, offline, race conditions de paginação. Com fake, você dispara em uma linha.

**Exemplo prático:**
```ts
// __tests__/application/SearchReposUseCase.test.ts
const repo = new FakeRepoRepository();
repo.search.mockRejectedValueOnce(new NetworkError());
const useCase = new SearchReposUseCase(repo);
await expect(useCase.execute({ query: 'react', page: 1 }))
  .rejects.toBeInstanceOf(NetworkError);
```

[FakeRepoRepository](../__tests__/test-utils/fakes/FakeRepoRepository.ts) é 24 linhas e dispensa qualquer setup. Threshold de cobertura em `application/` é 100% statements ([jest.config.js:48-53](../jest.config.js#L48-L53)) — só possível porque a camada é pura.

**Por que essa decisão no projeto:**
Demonstro que testabilidade não é "escrever mais testes", é **arquitetura que torna testes baratos**.

---

### 6. Quando Clean Architecture é exagero? Como justificar o custo em um teste técnico?

**Resposta:**
**É exagero quando:**
- App tem 1-2 telas, sem regra de negócio (lista estática, calculadora).
- Equipe de 1 dev, sem perspectiva de crescimento.
- Throwaway/protótipo com lifecycle de semanas.
- Lógica é praticamente "fetch → render" sem transformações, validações ou estados derivados.

**Não é exagero (vale o custo) quando:**
- Há **regras de negócio** que sobrevivem a mudanças de UI (validação de query, tradução de erro HTTP em erro de domínio).
- Stack vai mudar (libs em beta, plataforma jovem, migração planejada).
- Time vai crescer — onboarding fica previsível.
- Cobertura de testes é requisito.

**Justificativa em teste técnico:**
O entrevistador avalia **maturidade arquitetural**, não tamanho do código. Em teste técnico, Clean Architecture é uma **vitrine** — mostra que você sabe fazer mesmo quando o problema não exige. O risco é parecer over-engineered; mitigo isso reconhecendo o trade-off no README e mantendo as camadas **proporcionais** (não 12 abstrações por entidade).

**Por que essa decisão no projeto:**
Aqui o app tem 4 telas, mas tem **5 tipos de erro de domínio**, **paginação**, **persistência local**, **rate limit** e **dois modos (mock/real)**. A arquitetura paga a si mesma já. Resposta madura: "fiz Clean porque o cenário comporta; em CRUD de duas telas eu não faria".

---

## Bloco 2 — Camada de Domínio

### 7. O que mora na camada de domínio do projeto e por quê?

**Resposta:**
Em [`src/domain/`](../src/domain/) moram **três tipos** de artefatos:

1. **Entidades** (`Repository`, `Issue`, `Owner`, `Label`, `SavedRepo`): tipos imutáveis que representam conceitos do produto. **Sem comportamento atrelado ao framework**.
2. **Interfaces de repositório** (`IRepoRepository`, `IIssueRepository`, `ISavedReposRepository`): contratos do que o domínio precisa, sem dizer como.
3. **Erros de domínio** (`DomainError` abstrato + 5 concretos: `RateLimitError`, `NotFoundError`, `NetworkError`, `InvalidQueryError`, `UnexpectedError`): vocabulário de falha do negócio, não do HTTP.

**Por que assim:**
Domínio responde à pergunta *"o que esse app trata?"*, não *"como esse app obtém os dados?"*. Se amanhã trocássemos GitHub por GitLab, `Repository.fullName` ainda existe — só o mapper muda.

**Exemplo prático:**
```ts
// src/domain/entities/Repository.ts
export interface Repository {
  id: number;
  fullName: string;
  owner: Owner;
  stars: number;
  pushedAt: Date; // ← Date, não string ISO. Domínio fala em tipos do negócio.
  topics: string[];
  license: string | null;
}
```
Note `pushedAt: Date` (não `string`) e `license: string | null` (não objeto aninhado): domínio é a forma **conveniente para a aplicação**, não a forma da API.

**Por que essa decisão no projeto:**
Provo que sei modelar **vocabulário do produto**, não copiar shape de API. Esse é o teste que separa júnior de sênior.

---

### 8. Por que interfaces de repositório vivem no domínio, mas as implementações não?

**Resposta:**
Esse é o **Dependency Inversion Principle** materializado.
- A interface (`IRepoRepository`) representa **o que o domínio precisa**: "preciso de uma forma de buscar repositórios paginados".
- A implementação (`GitHubRepoRepository`) representa **uma forma de cumprir** isso: "uso Axios e a Search API do GitHub".

Se a interface morasse na infra, o use case (camada interna) teria que importar da infra (externa) — violação clássica. Colocando a interface no domínio:
- Use case importa **só do domínio**.
- Infra implementa **um contrato definido pelo domínio**.
- Setas de dependência continuam apontando pra dentro.

**Exemplo prático:**
```ts
// src/domain/repositories/IRepoRepository.ts  ← contrato no domínio
export interface IRepoRepository {
  search(params: SearchReposParams): Promise<PaginatedResult<Repository>>;
  getDetails(owner: string, repo: string): Promise<Repository>;
}

// src/infra/repositories/GitHubRepoRepository.ts  ← implementação na infra
export class GitHubRepoRepository implements IRepoRepository { /* ... */ }
```

**Por que essa decisão no projeto:**
Mostra que conheço a diferença entre **DI (Dependency Injection — passar a instância)** e **DIP (Dependency Inversion Principle — onde a interface mora)**. Confundir os dois é tropeço comum em entrevista.

---

### 9. Como modelar entidades (Repo, Issue, Owner) sem acoplar a respostas da API do GitHub?

**Resposta:**
Três técnicas usadas no projeto:

1. **Nomenclatura de domínio, não de API:** GitHub retorna `stargazers_count`, `full_name`, `pushed_at` (snake_case, vocabulário próprio). Entidades usam `stars`, `fullName`, `pushedAt` (camelCase, vocabulário do app).
2. **Tipos do domínio, não da serialização:** API manda `pushed_at: string` (ISO 8601). Domínio expõe `pushedAt: Date`. Mapper faz `new Date(dto.pushed_at)`.
3. **Estrutura achatada quando faz sentido:** API manda `license: { name, spdx_id }`. Domínio expõe `license: string | null` (só o nome). Se amanhã precisarmos do spdx, a entidade evolui — não o consumidor.

**Exemplo prático:**
```ts
// src/infra/http/mappers/repositoryMapper.ts
export function mapRepository(dto: RepositoryDto): Repository {
  return {
    id: dto.id,
    fullName: dto.full_name,
    stars: dto.stargazers_count,
    pushedAt: new Date(dto.pushed_at),
    topics: dto.topics ?? [],
    license: dto.license?.name ?? null,
  };
}
```

**Por que essa decisão no projeto:**
Anti-corruption layer explícito. Se a API muda `stargazers_count` pra `star_count`, conserto **um mapper**. UI, hooks, use cases, testes — nada quebra.

---

### 10. Por que o domínio não pode importar React Native, Axios ou React Query?

**Resposta:**
Três razões compostas:

1. **Estabilidade temporal:** essas libs são "rotational dependencies" — vão mudar antes do conceito de "repositório do GitHub" mudar. Se domínio depender delas, o churn dessas libs vira churn de domínio.
2. **Testabilidade em Node puro:** importar `react-native` força usar `jest-expo`, transformers nativos, mocks complexos. Domínio puro roda com `jest` mínimo e zero setup.
3. **Reutilização cross-platform:** mesmo domínio poderia rodar num backend Node, num CLI ou num app web. Só precisaria de novos adaptadores na infra.

**Como o projeto impõe:**
[`eslint.config.js:46-61`](../eslint.config.js#L46-L61) — `boundaries/external` com `from: 'domain', disallow: ['*']`. ESLint quebra o build na hora.

**Exemplo prático (do que NÃO está no domínio):**
```ts
// src/domain/repositories/IRepoRepository.ts — só tipos e interfaces
// ZERO imports de axios, react-query, react-native, async-storage
```

**Por que essa decisão no projeto:**
Mostra que entendo que **a regra de dependência é executável**, não aspiracional. Sênior sabe diferenciar "deveria" de "garantido".

---

### 11. Como garantir que o domínio é testável em Node puro? O que isso prova na prática?

**Resposta:**
Garantia vem da **disciplina de imports** reforçada pelo ESLint. Como não há `react-native`, `axios`, `AsyncStorage`, o teste roda com Jest cru, sem preset Expo.

Na prática, prova **três coisas**:
1. **A camada não tem cola escondida com framework** — se rodasse só com `jest-expo`, talvez houvesse import "leakado".
2. **Tempo de teste é trivial** — domínio + application têm threshold de **100% de cobertura** no `jest.config.js` exatamente porque é barato chegar lá.
3. **Lógica é a única coisa testada ali** — sem renderização, sem timer, sem rede. Falha de teste = bug de lógica, não flake.

**Exemplo prático:**
```ts
// __tests__/domain/errors/DomainError.test.ts
// roda em < 50ms, zero setup, valida que extends Error,
// que `code` é readonly, que stack trace funciona.
```

Thresholds que provam o ponto:
```js
// jest.config.js
'./src/domain/':      { statements: 100, branches: 100, functions: 100, lines: 100 },
'./src/application/': { statements: 100, branches: 95,  functions: 100, lines: 100 },
```

**Por que essa decisão no projeto:**
Cobertura alta em camada pura é **barata**; cobrar 100% em UI seria insano. Mostra que sei dosar cobertura por camada — não cair na armadilha de "100% global".

---

## Bloco 3 — Camada de Application / Use Cases

### 12. O que é um Use Case e qual sua responsabilidade no projeto (ex: `SearchReposUseCase`)?

**Resposta:**
Use case é a **unidade de orquestração de uma intenção do usuário**. Responde a uma frase do tipo *"o usuário quer buscar repositórios por nome"*. Ele:
1. Valida e normaliza entrada.
2. Orquestra um ou mais repositórios.
3. Aplica regra de negócio que não cabe em entidade (validação composta, política de paginação, fallback).
4. Devolve dado de domínio.

Não faz: renderização, navegação, cache de UI, HTTP direto.

**Exemplo prático:**
```ts
// src/application/use-cases/SearchReposUseCase.ts
export class SearchReposUseCase {
  constructor(private readonly repoRepository: IRepoRepository) {}

  async execute(input: SearchReposInput): Promise<PaginatedResult<Repository>> {
    const sanitized = this.sanitize(input.query);    // normaliza
    this.validate(sanitized);                         // regra (≥ 2 chars)
    return this.repoRepository.search({
      query: sanitized,
      page: input.page,
      perPage: input.perPage ?? 20,                   // política de default
    });
  }
  // ...
}
```

A validação de "query mínima de 2 caracteres" mora **aqui**, não na tela. Se amanhã houver uma busca por voz que pula a tela, a regra continua valendo.

**Por que essa decisão no projeto:**
Mostra que sei onde colocar regra de negócio. *"Se a UI sumir, a regra continua existindo?"* — se sim, é use case ou domínio.

---

### 13. Por que use cases recebem repositórios via construtor em vez de importá-los diretamente?

**Resposta:**
Importar a implementação concreta é o **anti-padrão de Service Locator escondido**. Quatro problemas:

1. **Não dá pra testar** — não há como substituir a dependência sem mockar o módulo inteiro.
2. **Quebra a regra de dependência** — `application` passa a importar de `infra`.
3. **Use case fica acoplado a uma única implementação** — sem como rodar com `InMemoryRepoRepository` em mock-mode.
4. **Imports cíclicos viram inevitáveis** quando o grafo cresce.

Construtor recebendo a interface é **Constructor Injection** — explícito, tipado, substituível. O grafo de instanciação fica concentrado num único ponto (DI container), o resto do código ignora.

**Exemplo prático:**
```ts
// composição centralizada em src/infra/di/container.ts
const repoRepository = USE_MOCK ? new InMemoryRepoRepository() : new GitHubRepoRepository();
export const container = {
  searchReposUseCase: new SearchReposUseCase(repoRepository),
  // ...
};
```

**Por que essa decisão no projeto:**
DI por construtor é o padrão mais simples que funciona — sem framework de DI (InversifyJS, tsyringe), sem decorator, sem reflexão. Mostra que sei aplicar o princípio sem cargo-cult.

---

### 14. Como use cases lidam com paginação, erros de API e rate limit sem acoplar à infraestrutura?

**Resposta:**
Três técnicas:

1. **Paginação via tipo de domínio** — `PaginatedResult<T>` ([Pagination.ts](../src/domain/repositories/Pagination.ts)) tem `items`, `totalCount?` (opcional porque `/issues` não retorna) e `hasNextPage`. Use case devolve isso e o hook decide como exibir.
2. **Erros como tipos de domínio** — quando a infra captura `axios.isAxiosError`, ela **traduz** via [`mapHttpError`](../src/infra/http/errorMapper.ts) para `RateLimitError`/`NotFoundError`/`NetworkError`/`UnexpectedError`. Use case nunca vê `AxiosError`.
3. **Rate limit como exceção tipada** — `RateLimitError` carrega `resetAt?: Date` parseado do header `x-ratelimit-reset`. Use case só propaga; tela decide se mostra banner com countdown.

**Exemplo prático:**
```ts
// src/infra/http/errorMapper.ts
if (isRateLimit(err)) {
  throw new RateLimitError(undefined, parseResetAt(err));
}
if (err.response.status === 404) {
  throw new NotFoundError(resourceContext ?? 'Recurso');
}
```
Do lado do use case, é só `throw`. Do lado da tela:
```ts
// src/presentation/utils/getErrorMessage.ts
if (error instanceof RateLimitError) return 'Você excedeu o limite...';
```

**Por que essa decisão no projeto:**
Provo que sei desenhar **fronteiras de erro**. Erro HTTP é detalhe técnico; erro de domínio é decisão de produto. Misturar os dois é bug em produção.

---

### 15. Diferença entre Use Case e Service da aplicação — quando usar cada um?

**Resposta:**
Distinção real, ignorada por muitos:

- **Use case:** orquestra **uma intenção concreta do usuário**. Granular, com nome no infinitivo (`SearchRepos`, `SaveRepo`). Tem entrada e saída claras. Vive por *user story*.
- **Application service:** **agrupa lógica reutilizada** por múltiplos use cases. Mais genérico (ex: `RateLimitTracker`, `NotificationDispatcher`).

Regra prática:
- Se a coisa **responde a uma ação do usuário** → use case.
- Se a coisa **é usada por múltiplos use cases** e não tem intenção direta → service.

No projeto, **não há services** porque não há lógica compartilhada que justifique. Cada use case orquestra um repositório, sem cross-cutting concern.

**Sinal de que precisaria de service:**
Se três use cases precisassem decidir "esse fetch já está em cooldown por rate limit?", um `RateLimitService` valeria. Hoje a tela trata isso, então não.

**Por que essa decisão no projeto:**
Mostra que **não invento abstração**. Service vazio é cheiro pior do que ausência de service. Resisti à tentação de "padronizar" criando services placeholder.

---

### 16. Como testar use cases isoladamente (mocks de repositório, asserts de comportamento)?

**Resposta:**
Padrão usado: **fakes tipados em vez de `jest.mock`**.

1. Cada interface tem um Fake correspondente em `__tests__/test-utils/fakes/` que **implementa a interface** com `jest.Mock` por método.
2. Testes injetam o fake no construtor.
3. Asserts são **comportamentais**: o método foi chamado com quais argumentos? O retorno é o esperado? A exceção certa é propagada?

**Exemplo prático:**
```ts
// __tests__/test-utils/fakes/FakeRepoRepository.ts
export class FakeRepoRepository implements IRepoRepository {
  search: jest.Mock<Promise<PaginatedResult<Repository>>, [SearchReposParams]>;
  getDetails: jest.Mock<Promise<Repository>, [string, string]>;
  constructor(defaults?: { search?: PaginatedResult<Repository>; getDetails?: Repository }) {
    this.search = jest.fn().mockResolvedValue(defaults?.search ?? { items: [], hasNextPage: false });
    this.getDetails = jest.fn().mockResolvedValue(defaults?.getDetails);
  }
}

// __tests__/application/SearchReposUseCase.test.ts
it('trims whitespace from query before delegating', async () => {
  const repo = new FakeRepoRepository();
  const useCase = new SearchReposUseCase(repo);
  await useCase.execute({ query: '  react  ', page: 1 });
  expect(repo.search).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 20 });
});
```

**Por que essa decisão no projeto:**
Fake tipado pega refactor de interface no `tsc`, `jest.mock` não. Mostra que TS é parceiro do teste, não decoração.

---

## Bloco 4 — Infraestrutura e Injeção de Dependência

### 17. Como funciona a implementação concreta de um repositório (`GitHubRepositoryImpl`)?

**Resposta:**
[`GitHubRepoRepository`](../src/infra/repositories/GitHubRepoRepository.ts) é a "concretização HTTP" do contrato. Faz quatro coisas:

1. **Fala HTTP** via `httpClient` (Axios pré-configurado).
2. **Constrói query da API** — `buildSearchQuery` decide se o input é um `owner/repo` (vira `repo:owner/name`) ou texto livre (vira `texto in:name,description`).
3. **Mapeia DTO → entidade** com `mapRepository`.
4. **Traduz erros HTTP em erros de domínio** com `mapHttpError`.

A classe **não conhece** React Query, AsyncStorage, telas. Só conhece HTTP e o contrato `IRepoRepository`.

**Exemplo prático:**
```ts
// src/infra/repositories/GitHubRepoRepository.ts
async search({ query, page, perPage }: SearchReposParams) {
  try {
    const response = await httpClient.get<SearchRepositoriesResponseDto>(
      '/search/repositories',
      { params: { q: buildSearchQuery(query), sort: 'stars', order: 'desc', page, per_page: perPage } },
    );
    const items = response.data.items.map(mapRepository);
    const totalCount = response.data.total_count;
    const hasNextPage = page * perPage < totalCount;
    return { items, totalCount, hasNextPage };
  } catch (err) {
    mapHttpError(err);
  }
}
```

**Por que essa decisão no projeto:**
Tudo que é "detalhe da API do GitHub" (snake_case, `in:name,description`, status 403 = rate limit) fica **encapsulado nesta classe**. Use case e UI não pagam pedágio.

---

### 18. O que é um DataSource e por que separá-lo do repositório? (mapper, anti-corruption layer)

**Resposta:**
Em projetos maiores, é comum partir o repositório em duas peças:
- **DataSource:** fala protocolo cru (HTTP/SQL/AsyncStorage). Devolve DTOs.
- **Repository:** orquestra um ou mais datasources, aplica mapper, traduz erros, devolve **entidades**.

No projeto, **não tenho `DataSource` como classe separada** — o `httpClient` (Axios instance) faz esse papel, e mappers (`mapRepository`, `mapIssue`) são funções puras. A separação existe **conceitualmente**:
- `httpClient` + DTOs = data source.
- `GitHubRepoRepository` = repository com mapper inline.

**Quando valeria classe separada?**
- Múltiplas fontes (HTTP + cache local fallback) compondo um repositório.
- DataSource compartilhado por múltiplos repositories.
- Testes de protocolo HTTP isolados de testes de mapeamento.

**Anti-corruption layer (Eric Evans):** mapper é a porta de entrada que protege o domínio do shape externo. Sem ele, qualquer mudança na API vaza pra UI.

**Exemplo prático:**
```ts
// src/infra/http/mappers/repositoryMapper.ts — anti-corruption layer
export function mapRepository(dto: RepositoryDto): Repository {
  return { id: dto.id, fullName: dto.full_name, stars: dto.stargazers_count, /* ... */ };
}
```

**Por que essa decisão no projeto:**
Mostra que sei **não criar abstração só porque a literatura tem nome**. DataSource separado seria placeholder. Reconheço o conceito, aplico quando paga.

---

### 19. Como o container de DI conecta interfaces a implementações? Mostre um exemplo conceitual.

**Resposta:**
DI manual via **Composition Root** ([container.ts](../src/infra/di/container.ts)) — um único arquivo monta o grafo de objetos no boot.

Vantagens vs. framework de DI (Inversify/tsyringe):
- Sem decorator, sem reflexão, sem `experimentalDecorators` no tsconfig.
- Tipado por construção — `container.searchReposUseCase` é `SearchReposUseCase`, sem `as` ou cast.
- Boot determinístico — fácil de seguir no debugger.
- Pode ser substituído em teste sem framework de override.

**Exemplo prático:**
```ts
// src/infra/di/container.ts
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

function buildRepoRepository(): IRepoRepository {
  if (USE_MOCK) return new InMemoryRepoRepository();
  return new GitHubRepoRepository();
}

const repoRepository = buildRepoRepository();
const issueRepository = buildIssueRepository();
const savedReposRepository = buildSavedReposRepository();

export const container = {
  searchReposUseCase:     new SearchReposUseCase(repoRepository),
  getRepoDetailsUseCase:  new GetRepoDetailsUseCase(repoRepository),
  listIssuesUseCase:      new ListIssuesUseCase(issueRepository),
  // ...
} as const;

export type Container = typeof container;
```

Telas consomem `container.searchReposUseCase` via hook — não criam instância, não sabem qual repository foi injetado.

**Por que essa decisão no projeto:**
DI manual prova que **conheço o princípio sem precisar do framework**. Frameworks de DI viraram cargo-cult em muitos projetos TS — saber quando dispensar é maturidade.

---

### 20. Por que mappers (DTO → Entidade) são importantes? O que acontece sem eles?

**Resposta:**
Mappers são a **fronteira que isola o domínio do shape externo**. Sem mappers:

1. **Vazamento de vocabulário** — todo o código consome `stargazers_count` em vez de `stars`.
2. **Vazamento de tipo de serialização** — `pushed_at: string` viraliza, UI faz `new Date(...)` em mil lugares, ninguém valida.
3. **Refactor catastrófico em mudança de API** — GitHub muda um campo, mil arquivos quebram.
4. **Domínio acoplado à fonte de dados** — não dá pra trocar GitHub por GitLab sem reescrever entidades.

Com mapper, **a mudança fica num arquivo**. Mapper é o ponto único de tradução.

**Exemplo prático (o que aconteceria sem):**
```ts
// SEM mapper — UI consome DTO direto:
<Text>{repo.stargazers_count.toLocaleString()}</Text>  // funciona hoje
// GitHub renomeia: stargazers_count → stars_count
// → quebra em N telas, N testes, N hooks
```
Com mapper:
```ts
// só mapRepository muda:
stars: dto.stars_count,  // antes: dto.stargazers_count
// UI segue intacta: <Text>{repo.stars.toLocaleString()}</Text>
```

**Por que essa decisão no projeto:**
Mostro que entendo **stability boundary**. Mapper é mais barato que o impacto da sua ausência — sempre.

---

### 21. Como trocar Axios por Fetch (ou AsyncStorage por MMKV) sem impacto no domínio?

**Resposta:**
Resposta concreta: **só mexo na infra**.

**Trocar Axios por Fetch:**
1. Reescrevo [`httpClient.ts`](../src/infra/http/httpClient.ts) — `createHttpClient` devolve um objeto com `.get<T>()` que chama `fetch` por baixo.
2. Reescrevo [`errorMapper.ts`](../src/infra/http/errorMapper.ts) — em vez de `axios.isAxiosError`, leio `response.status` e `response.headers` direto.
3. **Não toco em**: `IRepoRepository`, `SearchReposUseCase`, hooks, telas, testes de domínio/application.

**Trocar AsyncStorage por MMKV:**
1. Crio `MMKVSavedReposRepository implements ISavedReposRepository`.
2. Edito uma linha no container:
```ts
function buildSavedReposRepository(): ISavedReposRepository {
  if (USE_MOCK) return new InMemorySavedReposRepository();
  return new MMKVSavedReposRepository(); // antes: AsyncStorageSavedReposRepository
}
```
3. Pronto. Use case `SaveRepoUseCase` não percebe.

**Custo que mediria em horas, não dias.** É o ROI da arquitetura.

**Por que essa decisão no projeto:**
Mostra que **substituibilidade é mensurável**. Em entrevista, prove com exemplo cirúrgico — não no abstrato.

---

## Bloco 5 — Apresentação, Hooks e Cache

### 22. Por que telas não chamam use cases diretamente, mas sim através de hooks customizados?

**Resposta:**
Hook customizado é a **fronteira entre use case e React**. Faz três coisas que a tela não deveria fazer:

1. **Integra com React Query** (cache, retry, paginação infinita).
2. **Gerencia chave de cache** (`queryKey`), invalidação, enabled-state.
3. **Esconde o `container` da tela** — `useSearchRepos({ query })` é mais legível do que `useInfiniteQuery({ queryFn: () => container.searchReposUseCase.execute(...) })`.

Sem hook intermediário, cada tela duplicaria boilerplate de React Query. Pior: cache key, retry policy e enabled-state ficariam inconsistentes entre telas.

**Exemplo prático:**
```ts
// src/presentation/hooks/useSearchRepos.ts
export function useSearchRepos({ query }: UseSearchReposParams) {
  const trimmedQuery = query.trim();
  const enabled = trimmedQuery.length >= 2;
  return useInfiniteQuery({
    queryKey: ['searchRepos', trimmedQuery],
    queryFn: ({ pageParam }) =>
      container.searchReposUseCase.execute({ query: trimmedQuery, page: pageParam, perPage: PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length + 1 : undefined,
    enabled,
  });
}
```

Tela vira código de **UI pura**:
```ts
const { data, fetchNextPage, hasNextPage, isLoading, error, refetch } =
  useSearchRepos({ query: debouncedQuery });
```

**Por que essa decisão no projeto:**
Hook é **adaptador** entre Use Case (puro) e React Query (framework). Mostra que sei separar lógica de produto (use case) de lógica de cache/estado (hook).

---

### 23. Como o React Query (ou similar) se encaixa na arquitetura sem violar a inversão de dependência?

**Resposta:**
React Query mora **só na presentation** — em `src/presentation/hooks/` e `src/infra/query/` (QueryClient + Provider). Domínio e application **não importam** React Query.

A regra fica preservada porque:
- React Query consome **resultado do use case**, não substitui ele.
- Use case devolve `Promise<PaginatedResult<T>>` puro; React Query coloca cache, dedup, retry **em cima**.
- Se removêssemos React Query e usássemos `useState + useEffect`, os hooks mudariam, mas use case e domínio ficariam intactos.

**Risco anti-padrão (evitado aqui):** misturar regra de negócio dentro de `queryFn`. Por exemplo, validar query length dentro do hook em vez do use case. Aqui, `SearchReposUseCase` valida; `useSearchRepos` só decide `enabled`. As duas responsabilidades convivem sem conflito.

**Exemplo prático:**
```ts
// queryClient.ts decide POLÍTICA de cache/retry — não regra de negócio:
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof RateLimitError) return false;   // determinístico
  if (error instanceof InvalidQueryError) return false;
  if (error instanceof NotFoundError) return false;
  return failureCount < 1;                              // transiente
}
```
Note: `queryClient` faz `instanceof DomainError` — depende do domínio (interno), domínio não depende dele. Direção correta.

**Por que essa decisão no projeto:**
Provo que **biblioteca de cache não é arquitetura**. RQ é detalhe; entrei e saio dele sem que o resto do app sinta.

---

### 24. Como tratar stale-while-revalidate, cache offline e estados de loading discretos?

**Resposta:**
Stale-while-revalidate vem **de graça** do React Query: `staleTime: 5min` ([queryClient.ts:7](../src/infra/query/queryClient.ts#L7)) — dentro desse período, dado é considerado fresco e nada refetcha. Depois fica **stale**, e qualquer remount dispara revalidação em background enquanto exibe o cache.

Cache offline: aqui só usei o cache em memória do RQ. Pra persistência real, plugaria `@tanstack/react-query-persist-client` com AsyncStorage — **sem mexer em use case**.

**Estados de loading discretos** distinguidos no `useSearchRepos`:
- `isLoading` — **primeira** carga (cache vazio).
- `isFetching` — **qualquer** refetch (inclusive background).
- `isFetchingNextPage` — paginação.
- `isRefetching` — pull-to-refresh.

A [`SearchScreen`](../src/presentation/screens/SearchScreen.tsx) usa cada um:
- `isLoading` → mostra `Skeleton` (6 placeholders).
- `isFetching && !isFetchingNextPage` → indica refresh no `RefreshControl`.
- `isFetchingNextPage` → spinner no footer.

**Exemplo prático:**
```tsx
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={isFetching && !isFetchingNextPage}
      onRefresh={() => { void refetch(); }}
    />
  }
  ListFooterComponent={() =>
    isFetchingNextPage ? <Spinner /> : null
  }
/>
```

**Por que essa decisão no projeto:**
Mostro que sei **separar tipos de loading**. UX de qualidade não é "sempre spinner full screen"; é skeleton no início, banner discreto na revalidação, spinner inline na paginação.

---

### 25. Como o Design System (tokens, ThemeProvider, useTheme) garante consistência e tipagem?

**Resposta:**
Stack: **`@shopify/restyle`** + tema tipado + dois temas (`lightTheme`/`darkTheme`) com mesma shape.

Garantias:
1. **Tokens são tipados** — `createTheme({ colors, spacing, borderRadii, textVariants, ... })` deriva `type Theme = typeof lightTheme`. `useTheme<Theme>()` retorna autocomplete.
2. **`Box` e `Text`** são primitivas com props limitadas aos tokens — `padding="xxl"` só compila se `xxl` existir em `spacing`.
3. **Variants** (`textVariants`, `buttonVariants`, `cardVariants`) — composição nomeada. `<Text variant="h1">` em vez de `fontSize={22} fontWeight="600"`.
4. **Theme switching tipado** — `AppThemeProvider` controla `mode: 'light' | 'dark' | 'system'`, persiste em AsyncStorage, expõe via `useThemeMode()`.

**Exemplo prático:**
```tsx
// Componente consumindo tokens — props NÃO aceitam string arbitrária
<Box paddingHorizontal="xxxl" paddingTop="md" gap="lg" backgroundColor="bg">
  <Text variant="h2">Resultados</Text>
</Box>
```
Trocar `paddingHorizontal="xxxl"` por `"banana"` é erro de compilação.

**Por que essa decisão no projeto:**
Tokens tipados são **arquitetura de UI**, não decoração. Mostra que entendo que consistência visual é problema de tipo, não de revisão de PR.

---

### 26. Estratégia de tratamento de estados: loading, empty, erro, rate limit e sem conexão.

**Resposta:**
**Cinco estados explícitos**, cada um com componente dedicado:

1. **Loading** → `Skeleton` (não spinner full screen): preserva layout, transmite "está vindo".
2. **Empty (sem query)** → `EmptyState` com copy "Digite ao menos 2 caracteres".
3. **Empty (com query, zero resultados)** → `EmptyState` com copy dinâmica via [`getEmptySearchCopy`](../src/presentation/utils/getEmptySearchCopy.ts) (sugestões baseadas na query).
4. **Erro genérico** → `EmptyState` + `getErrorMessage(error)` (traduz erro de domínio em texto).
5. **Rate limit** → `RateLimitBanner` no topo + `EmptyState` embaixo. Banner expõe `resetAt` se disponível.

**Ordem dos guards na tela ([SearchScreen.tsx:71-120](../src/presentation/screens/SearchScreen.tsx#L71-L120)):**
```ts
if (!queryHasMinLength) → empty informativo
if (isLoading)          → skeleton
if (error !== null)     → banner (se rate limit) + erro
if (repos.length === 0) → empty contextual
default                 → FlatList com itens
```

**Tradução de erro centralizada:**
```ts
// src/presentation/utils/getErrorMessage.ts
if (error instanceof RateLimitError)  return 'Você excedeu o limite de requisições...';
if (error instanceof NetworkError)    return 'Sem conexão. Verifique sua internet...';
if (error instanceof NotFoundError)   return error.message;
if (error instanceof InvalidQueryError) return error.message;
if (error instanceof DomainError)     return error.message;
return 'Ocorreu um erro inesperado. Tente novamente.';
```

Função **pura**, fácil de testar (`__tests__/presentation/utils/getErrorMessage.test.ts`).

**Por que essa decisão no projeto:**
Cada estado tem **componente próprio + copy controlada**. Mostra que entendo que UX em erro/empty é onde apps amadores tropeçam.

---

## Bloco 6 — Testes, Qualidade e Decisões Práticas

### 27. Estratégia de testes: o que testar em cada camada e por quê? (pirâmide invertida no domínio)

**Resposta:**
Pirâmide deliberada — **cobertura alta nas camadas internas, cobertura focada nas externas**:

| Camada | Tipo de teste | Cobertura alvo | Velocidade |
|---|---|---|---|
| `domain` | Unitário puro (Node) | **100%** | < 1s todos |
| `application` (use cases) | Unitário com Fakes | **100% st / 95% br** | < 1s |
| `infrastructure` (mappers, errorMapper, repos) | Unitário + integração leve (AsyncStorage) | 80%+ | < 5s |
| `presentation` (hooks, screens, components) | RNTL + RQ provider | 80%+ | maior |

**O que testar onde:**
- **Domínio:** invariantes de entidade, comportamento de exceções (extends Error, code constante, stack trace).
- **Application:** validação, sanitização, propagação correta de erros, valores default (perPage = 20).
- **Infra:** mapper DTO→entity (campo a campo), errorMapper (cada status HTTP), repository contra fakes do storage.
- **Presentation:** hook com `renderHook` + QueryClient de teste, screens com `render` + mock do container.

**Configuração no `jest.config.js`:**
```js
coverageThreshold: {
  global:            { statements: 80,  branches: 75,  functions: 80,  lines: 80 },
  './src/domain/':   { statements: 100, branches: 100, functions: 100, lines: 100 },
  './src/application/': { statements: 100, branches: 95, functions: 100, lines: 100 },
},
```

**Por que essa decisão no projeto:**
Cobertura global única é mentira — esconde lacunas nas camadas críticas. Threshold por camada **prova** que sei calibrar.

---

### 28. Como o TypeScript estrito (sem `any`) reforça os contratos entre camadas?

**Resposta:**
`any` é o solvente que dissolve arquitetura. Sem ele, contratos viram **checados pelo compilador**, não pelo revisor.

Mecanismos no projeto:
1. **`@typescript-eslint/no-explicit-any: 'error'`** ([eslint.config.js:22](../eslint.config.js#L22)) — proíbe `any` literal.
2. **Generics em PaginatedResult** — `Promise<PaginatedResult<Repository>>` deixa claro o T; mock errado não compila.
3. **`unknown` em fronteiras de erro** — `getErrorMessage(error: unknown)` força narrow via `instanceof`.
4. **`@typescript-eslint/consistent-type-imports: 'error'`** — separa import de tipo de import de runtime, evita ciclos sutis.
5. **`as const` em `container`** — `Container` é o **tipo do objeto literal**, não interface manual.

**Exemplo prático:**
```ts
// fronteira: errorMapper recebe unknown, não Error nem AxiosError
export function mapHttpError(err: unknown, resourceContext?: string): never {
  if (!axios.isAxiosError(err)) {
    throw new UnexpectedError();
  }
  // a partir daqui, TS sabe que err é AxiosError
}
```

```ts
// getErrorMessage: discriminação por instanceof, sem cast:
if (error instanceof RateLimitError) return '...';
if (error instanceof NetworkError)   return '...';
```

**Por que essa decisão no projeto:**
TS estrito é a **versão tipada da regra de dependência**. Mostra que sei usar o compilador como **co-autor**, não como obstáculo.

---

### 29. Quais foram os trade-offs feitos no projeto? (over-engineering vs. pragmatismo)

**Resposta:**
Decisões e o que renunciei:

1. **Sem framework de DI** (Inversify/tsyringe). Trade-off: ganho boot determinístico e zero magia; abro mão de auto-wiring para grafos grandes. **Vale a pena aqui** — grafo tem ~8 use cases.
2. **DataSource não é classe separada.** Trade-off: menos uma camada; abro mão de reuso entre repositórios se algum dia compartilharem fonte. **Pago quando precisar**, não antes.
3. **Mock-mode por env var** em vez de feature flag runtime. Trade-off: switch requer reload, mas é simples de testar e zero cost em produção.
4. **Restyle em vez de Tamagui/NativeWind.** Trade-off: API mais verbosa, sem otimização avançada de RN; ganho tipagem forte de tokens com bundle pequeno e zero dependência de Babel plugin pesado.
5. **Erros como classes (não union de strings).** Trade-off: classe carrega `instanceof` confiável + payload (`resetAt`), abre mão da exhaustiveness check trivial. Patternmatching via `instanceof` é suficiente.
6. **React Query em vez de RTK Query/SWR.** Trade-off: maturidade em RN e melhor infinite-query API; abro mão da integração com Redux DevTools (que aqui não preciso).
7. **Sem MSW/nock para testes de infra HTTP.** Trade-off: testo `errorMapper` e mappers isolados; abro mão de teste end-to-end do `GitHubRepoRepository`. Aceito porque a fronteira HTTP é fina.

**Por que essa decisão no projeto:**
Mostro **consciência de cada trade-off**. Entrevistador sênior valoriza quem narra o "não fiz X porque Y" — é sinal de que considerou opções.

---

### 30. O que você faria diferente com mais tempo, e por quê? (resposta crítica e madura)

**Resposta:**
Lista priorizada, do impacto maior pro menor:

1. **Persistência do cache do React Query** (`@tanstack/react-query-persist-client` + AsyncStorage). UX offline básica sai de graça — abrir o app sem internet exibiria os dados da última sessão. **Por que não fiz:** escopo do teste técnico não exigia, e custaria 1-2h de polimento.

2. **Storybook para o Design System.** Hoje tenho [`mockups/`](../mockups/) com showcases, mas Storybook seria documentação executável e visual regression test.

3. **Testes E2E com Detox ou Maestro** em pelo menos o fluxo Search → Detail → Save. Cobre o "tudo integrado" que unit não pega.

4. **Mover validações compartilhadas pra `application/validators/`.** Hoje `SearchReposUseCase.validate` e `ListIssuesUseCase` têm validações inline. Com mais 2-3 use cases, viraria service.

5. **Tracker de rate limit reativo.** Hoje o erro mostra banner; com background tracking, eu poderia **prevenir** a request quando `x-ratelimit-remaining` for baixo.

6. **i18n.** Strings hardcoded em pt-BR via funções (`getErrorMessage`). Trocaria por `i18next` ou `formatjs` se houvesse requisito multi-idioma.

7. **MSW para testar `GitHubRepoRepository` end-to-end** — provaria também que `errorMapper` é acionado nas paths certas.

8. **Migrar AsyncStorage para MMKV.** Performance ~30× melhor; e como já mostrei, troca seria local.

**O que NÃO faria:**
- Adicionar Redux/Zustand. Não há estado global suficiente para justificar.
- Quebrar `presentation` em pastas por feature. O app é pequeno; pastas por tipo (`screens`, `hooks`, `components`) ainda paga.
- Framework de DI. Container manual atende.

**Por que essa decisão no projeto:**
Mostro **autocrítica calibrada** — não é "tudo está perfeito" nem "tudo está errado". Sênior reconhece dívida técnica como decisão consciente, não fracasso.

---

## Top 5 — perguntas mais prováveis de cair

Ranking baseado no que o **código revela como diferencial** e no que **entrevistadores de vagas mid/sênior em RN tipicamente pinçam**:

1. **#22 — Por que telas não chamam use cases diretamente, mas sim através de hooks customizados?**
   *Conecta arquitetura à prática diária. Resposta ruim aqui = candidato não diferencia "camada" de "biblioteca".*

2. **#19 — Como o container de DI conecta interfaces a implementações?**
   *Teste cirúrgico do princípio mais central. Quem vacila aqui não entendeu Clean.*

3. **#14 — Como use cases lidam com paginação, erros de API e rate limit sem acoplar à infraestrutura?**
   *Pergunta de cenário real. Mistura múltiplas camadas (use case + errorMapper + tipo de erro de domínio).*

4. **#27 — Estratégia de testes: o que testar em cada camada e por quê?**
   *Cobertura por camada com threshold diferenciado é decisão sênior. Mostra calibragem, não fanatismo.*

5. **#29 — Quais foram os trade-offs feitos no projeto?**
   *Pergunta-armadilha clássica. Quem não tem resposta consciente parece ter copiado a arquitetura, não decidido.*

**Dica de defesa em entrevista:** se travar em qualquer outra, ancore em **um arquivo concreto do projeto**. *"Posso te mostrar como faço isso no [`SearchReposUseCase.ts`](../src/application/use-cases/SearchReposUseCase.ts)..."* É a forma mais rápida de virar uma pergunta abstrata em conversa técnica concreta — e é onde sênior mostra que constrói, não decora.
