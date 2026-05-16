# github-explorer — Setup

Aplicativo mobile em **Expo SDK 54** para explorar a API pública do GitHub.
Este documento descreve **todo o setup feito até agora** — stack, estrutura,
ferramentas e como rodar localmente.

---

## Stack

| Camada              | Tecnologia                                            |
| ------------------- | ----------------------------------------------------- |
| Runtime / Build     | Expo SDK `~54.0.33` (New Architecture habilitada)     |
| RN / React          | React Native `0.81.5` · React `19.1.0`                |
| Linguagem           | TypeScript `~5.9.2` (modo `strict`)                   |
| Navegação           | `@react-navigation/native` v7 + native-stack + tabs   |
| Estilo / Tema       | `@shopify/restyle` v2                                 |
| Data fetching       | `@tanstack/react-query` v5                            |
| HTTP                | `axios` v1                                            |
| Gestos / Telas      | `react-native-gesture-handler`, `react-native-screens`, `react-native-safe-area-context` |
| Lint                | ESLint v9 flat config + `eslint-config-universe/native` + `eslint-plugin-boundaries` + `eslint-plugin-import` |
| Format              | Prettier v3                                           |
| Testes              | Jest v30 + `jest-expo` + `@testing-library/react-native` v13 + `jest-native` |
| Gerenciador         | pnpm `10.32.1`                                        |

---

## Estrutura de pastas

Arquitetura em camadas (Clean Architecture). Cada camada tem alias próprio e
restrição de dependência aplicada pelo `eslint-plugin-boundaries`.

```
github-explorer/
├── App.tsx                 # entry RN (placeholder atual)
├── index.ts                # registerRootComponent
├── app.json                # config Expo (newArchEnabled: true)
├── babel.config.js         # preset-expo + module-resolver
├── tsconfig.json           # strict + paths
├── eslint.config.js        # flat config + boundaries
├── jest.config.js          # jest-expo preset
├── .prettierrc.js
├── .env.example            # GITHUB_TOKEN (opcional)
│
├── src/
│   ├── domain/             # entidades, repos (interfaces), erros — núcleo puro
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── errors/
│   │
│   ├── application/        # use-cases — orquestra domínio
│   │   └── use-cases/
│   │
│   ├── infrastructure/     # adapters concretos (HTTP, DI, theme, nav, repos)
│   │   ├── http/
│   │   ├── repositories/
│   │   ├── di/
│   │   ├── theme/
│   │   └── navigation/
│   │
│   └── presentation/       # screens, hooks UI, design-system
│       ├── screens/
│       ├── hooks/
│       └── design-system/
│
├── __tests__/              # espelha src/ por camada
│   ├── domain/
│   ├── application/
│   └── presentation/
│
├── mockups/                # mockups HTML de referência (Octolens)
│   ├── README.md
│   ├── source/octolens-mockups.html
│   └── octolens-mockups-standalone.html
│
└── assets/                 # ícones / splash padrão Expo
```

### Regras de dependência (impostas via lint)

```
domain          →  nada
application     →  domain
infrastructure  →  domain, application
presentation    →  domain, application, infrastructure
```

Trecho real do `eslint.config.js`:

```js
'boundaries/element-types': [
  'error',
  {
    default: 'allow',
    rules: [
      { from: 'domain',         disallow: ['application', 'infrastructure', 'presentation'] },
      { from: 'application',    disallow: ['infrastructure', 'presentation'] },
      { from: 'infrastructure', disallow: ['presentation'] },
    ],
  },
],
```

---

## Path aliases

Configurados em **três lugares** (TS / Babel / Jest) para manter resolução
consistente em build, runtime e testes:

| Alias              | Caminho                |
| ------------------ | ---------------------- |
| `@/domain/*`       | `src/domain/*`         |
| `@/application/*`  | `src/application/*`    |
| `@/infrastructure/*` | `src/infrastructure/*` |
| `@/presentation/*` | `src/presentation/*`   |

---

## Configurações de TypeScript

`tsconfig.json` herda `expo/tsconfig.base` e ativa:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`

---

## Lint

Regras-chave habilitadas:

- `@typescript-eslint/no-explicit-any` — `error`
- `@typescript-eslint/no-unused-vars` — `error`
- `@typescript-eslint/consistent-type-imports` — `error`
- `import/no-cycle` — `error`
- `boundaries/element-types` — bloqueia imports cross-layer ilegais

---

## Testes

- Preset: `jest-expo`
- Setup: `@testing-library/jest-native/extend-expect`
- `testMatch` cobre `__tests__/**/*.test.{ts,tsx}` e `src/**/*.test.{ts,tsx}`
- Coverage focado em `src/domain` e `src/application` (regras de negócio)

---

## Variáveis de ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

| Variável       | Obrigatória | Descrição                                                       |
| -------------- | ----------- | --------------------------------------------------------------- |
| `GITHUB_TOKEN` | Não         | PAT do GitHub. Eleva rate limit REST de 60 → 5000 req/hora.    |

---

## Como rodar

Pré-requisitos: Node LTS, **pnpm 10**, Expo Go (ou simulador iOS / emulador Android).

```bash
pnpm install
pnpm start          # Metro / Expo dev server
pnpm ios            # abre no simulador iOS
pnpm android        # abre no emulador Android
pnpm web            # web preview
```

Scripts utilitários:

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint .
pnpm lint:fix
pnpm format         # prettier --write
pnpm test
pnpm test:watch
pnpm test:coverage
```

---

## O que está feito

- [x] Bootstrap Expo SDK 54 (New Architecture on)
- [x] TypeScript strict + paths
- [x] Estrutura Clean Architecture (`domain` / `application` / `infrastructure` / `presentation`)
- [x] Aliases `@/*` em TS, Babel e Jest
- [x] ESLint flat config + boundaries (regras de camada aplicadas)
- [x] Prettier
- [x] Jest + RNTL + jest-native
- [x] Dependências instaladas: React Navigation v7, Restyle, React Query v5, Axios
- [x] `.env.example` com `GITHUB_TOKEN`
- [x] Mockups (Octolens) versionados em `mockups/`
- [x] `App.tsx` placeholder confirma boot do RN

## Próximos passos

- [ ] Tema Restyle em `src/infrastructure/theme/`
- [ ] Cliente HTTP axios + interceptor de token em `src/infrastructure/http/`
- [ ] Entidades `Repository` / `User` em `src/domain/entities/`
- [ ] Interfaces de repositório em `src/domain/repositories/`
- [ ] Implementações REST em `src/infrastructure/repositories/`
- [ ] Use-cases de busca de repos / detalhes em `src/application/use-cases/`
- [ ] DI container em `src/infrastructure/di/`
- [ ] Navegação (stack + tabs) em `src/infrastructure/navigation/`
- [ ] Telas de listagem / detalhe em `src/presentation/screens/`
- [ ] QueryClient + provider no `App.tsx`

---

## Troubleshooting

### Tema dark/light não trocava ao alternar appearance no simulador iOS

**Sintoma.** `useColorScheme()` do React Native retornava sempre `'light'`,
independentemente de:

- Toggle de appearance no simulador (Cmd+Shift+A · Features → Toggle Appearance).
- Mudança em `Settings → Developer → Dark Appearance`.
- Reload do Metro (Cmd+R) e restart do Expo Go.

Log obtido em [AppThemeProvider.tsx](../src/infrastructure/theme/AppThemeProvider.tsx):

```
[ThemeProvider] { isHydrated: true, mode: "system", resolvedScheme: "light", systemScheme: "light" }
```

Mesmo `systemScheme: "light"` após toggle confirmava que a API estava
travada, não o pipeline de tema.

**Causa raiz.** [`app.json`](../app.json) tinha:

```json
"userInterfaceStyle": "light"
```

Esse campo é **config nativa**: Expo gera `Info.plist` (iOS) e `styles.xml`
(Android) com `UIUserInterfaceStyle = Light`, o que força o sistema a
sempre reportar `light` independente da preferência do usuário.
`useColorScheme()` do RN lê dessa config — por isso retornava `'light'`
fixo.

**Solução.**

1. Trocar em `app.json`:

   ```json
   "userInterfaceStyle": "automatic"
   ```

   Valores aceitos: `"light"` · `"dark"` · `"automatic"`. `automatic`
   deixa o app seguir o sistema operacional. Doc oficial:
   <https://docs.expo.dev/versions/v54.0.0/config/app/#userinterfacestyle>

2. Como é config nativa, **reload não basta**. Sequência:

   ```bash
   # Mata Metro (Ctrl+C no terminal do expo start)
   xcrun simctl terminate booted host.exp.Exponent   # kill Expo Go no sim
   npx expo start -c                                 # restart c/ cache limpo
   ```

   Depois reabre o app no simulador. O manifest novo é lido apenas em
   cold start do Expo Go.

3. Para verificar:

   - Toggle appearance: **Sim menu → Features → Toggle Appearance**
     (Cmd+Shift+A).
   - Log de `useColorScheme()` deve alternar entre `'light'` e `'dark'`
     em tempo real.

**Lições.**

- `userInterfaceStyle` é uma das poucas configs Expo que NÃO se aplicam
  via fast refresh — qualquer mudança exige restart frio do Expo Go ou
  rebuild do dev-client.
- `prebuild --clean` só é necessário em projetos com dev-client/bare.
  Expo Go lê o manifest em runtime.
- O pipeline em [AppThemeProvider.tsx](../src/infrastructure/theme/AppThemeProvider.tsx)
  estava correto desde o início — `useColorScheme` + `useMemo` + swap
  `lightTheme`/`darkTheme` na `RestyleThemeProvider`. O bug era 100%
  configuração.

---

## Sobre a pasta `mockups/`

Os mockups HTML nessa pasta foram gerados por IA como referência visual
inicial (branding "Octolens" + 7 telas). Após análise, decidi:

1. Reduzir escopo às 4 telas requeridas pelo PDF.
2. Remover branding "Octolens" — uso nome neutro ("github-explorer").
3. Aproveitar apenas: sistema de tokens (cores/spacing/radius),
   componentes base (Button/Input/Card/Badge/Avatar), e estrutura
   visual das 4 telas mantidas (Search/Detail/Issues/DesignSystem).
4. Descartar: SavedScreen, FeedScreen, ProfileScreen, Bottom Tabs com 4 abas,
   contribution graph (GraphQL), pinned repos.

Justificativa: telas extras introduziam complexidade fora do escopo
do teste (estado local persistido, GraphQL, mapeamento polimórfico
de eventos) sem agregar pontos avaliados.
