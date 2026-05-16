# Handoff: Octolens — Cliente Mobile da GitHub API

## Overview

Octolens é um app mobile (React Native) que consome a REST API pública do GitHub. Permite ao usuário **explorar repositórios em alta**, **salvar repositórios em coleções**, **acompanhar feed de atividade** de orgs/usuários seguidos, e **ver o próprio perfil** — além de telas em stack para **detalhes de repositório** e **issues**.

Este pacote contém os mockups visuais de alta fidelidade das 7 telas em tema claro e escuro, prontos para serem reimplementados em React Native.

## About the Design Files

Os arquivos HTML neste pacote são **referências de design** — protótipos que mostram o look-and-feel pretendido, **não código de produção pra copiar diretamente**. A tarefa é **recriar esses designs em React Native** (recomendado: Expo + TypeScript) usando os padrões e bibliotecas estabelecidos do projeto. As medidas, cores e tipografia documentadas abaixo são a fonte da verdade.

Se o codebase de destino ainda não existe, o stack sugerido é:
- **Expo (SDK mais recente)** + **TypeScript**
- **React Navigation** (Bottom Tabs + Native Stack)
- **TanStack Query** (`@tanstack/react-query`) para data fetching e cache
- **Axios** ou **fetch** com wrapper tipado para a GitHub REST API
- **expo-font** + **Geist** (Google Fonts)
- **@tabler/icons-react-native** ou **lucide-react-native** para ícones

## Fidelity

**High-fidelity (hifi).** As mocks contêm cores finais, tipografia, espaçamentos e estados. A intenção é fidelidade pixel-perfect na implementação, usando as bibliotecas do projeto.

---

## Arquitetura de Navegação

O app combina **Bottom Tab Navigator** (4 tabs) com um **Native Stack Navigator** (telas empilhadas em cima das tabs).

```
RootStack
├── TabsNavigator (default)
│   ├── ExploreTab    → ExploreScreen
│   ├── SavedTab      → SavedScreen
│   ├── FeedTab       → FeedScreen
│   └── ProfileTab    → ProfileScreen
├── RepoDetailScreen  (push)
├── IssuesScreen      (push)
└── DesignSystemScreen (push, dev-only)
```

- **Tab screens** (4) têm bottom nav visível e header simples sem botão voltar.
- **Stack screens** (3) **não têm bottom nav** — têm header com botão voltar (`ti-arrow-left`).

---

## Screens

### 01 · ExploreScreen (tab)

**Purpose:** descobrir repositórios em alta, buscar por termo, filtrar por categoria.

**Layout (top → bottom):**
1. StatusBar (system)
2. AppBar: `<h1>Explorar</h1>` à esquerda, dois `icon-btn` à direita (`ti-adjustments-horizontal`, `ti-bell`)
3. SearchInput: pill com `ti-search`, input controlado, `kbd` "⌘K" como atalho indicativo
4. ChipRail horizontal (scroll-x): "Trending" (active, com `ti-flame`), "Mobile", "TypeScript", "Rust", "AI"
5. SectionTitle: "Top resultados · 24.318" + link "Filtros"
6. RepoList (vertical, gap 10): cards de repositório
7. LoaderRow (skeleton de carregamento)
8. BottomNav (sticky)

**RepoCard:**
- Avatar 36×36, border-radius 10, gradient (5 variantes pré-definidas)
- Coluna principal:
  - Nome: `<span class="owner">facebook</span>/react-native` (owner em mono 12px, repo em sans 15px 600)
  - Descrição: 13px / 1.5 / `--fg-2`
  - Meta: estrela (cor warning) · lang-dot + linguagem · fork · clock (todos em mono 11px)

**Endpoint principal:** `GET /search/repositories?q={query}&sort=stars&order=desc&per_page=20`

---

### 02 · SavedScreen (tab)

**Purpose:** ver repositórios salvos (starred do usuário) organizados em coleções/folders criadas localmente.

**Layout:**
1. AppBar: "Salvos" + `ti-folder-plus` (criar coleção) + `ti-dots`
2. ChipRail: "Coleções" (active), "Todos · 47", "Recentes"
3. SectionTitle: "Suas coleções · 4" + link "Editar"
4. CollectionGrid: 2×2, cada `CollectionCard` com:
   - Icon container 32×32 com cor sólida (oklch) + ícone branco
   - Nome (14px 600) + count (mono 11px)
   - Avatar-stack: 3 mini-avatares 22×22 empilhados com offset -8px e border do surface
5. SectionTitle: "Salvos recentemente"
6. RepoList compacto (sem descrição, só nome + meta "salvo há X")
7. BottomNav

**Coleções no mockup:** Mobile (azul), Backend (vermelho), Ferramentas (verde), AI & ML (amarelo). Coleções são **estado local** (AsyncStorage ou MMKV) — o GitHub não tem conceito nativo de coleções; o que se sincroniza com a API é a lista de starred.

**Endpoint principal:** `GET /users/{username}/starred?per_page=50`

---

### 03 · FeedScreen (tab)

**Purpose:** atividade recente de orgs e usuários seguidos — releases, stars, PRs merged, forks.

**Layout:**
1. AppBar: "Atividade" + `ti-filter`
2. ChipRail: "Tudo" (active), "Releases", "Stars", "Pull requests"
3. FeedList: lista vertical de `ActivityItem` separados por hairline border, sem cards

**ActivityItem:**
- Ícone 32×32 colorido (4 variantes):
  - `release` → âmbar (`ti-tag`)
  - `star` → âmbar warning (`ti-star-filled`)
  - `pr` → magenta (`ti-git-pull-request`)
  - `fork` → accent violet (`ti-git-fork`)
- Body:
  - Line: texto com `<span class="handle">@user</span>` (mono accent) e `<b>repo</b>`
  - Optional preview card: para release ou PR mostra detalhe (versão, tag, número, stats `+X −Y`)
  - Time: mono 11px `--fg-3` ("há 12 minutos")

**Tipos de evento (GitHub Events API):**
- `ReleaseEvent` → "publicou {tag}"
- `WatchEvent` (action: started) → "favoritou {repo}"
- `PullRequestEvent` (action: closed, merged: true) → "mergeou PR em {repo}"
- `ForkEvent` → "fez fork de {repo}"

**Endpoint principal:** `GET /users/{username}/received_events?per_page=30`

---

### 04 · ProfileScreen (tab)

**Purpose:** perfil do usuário autenticado — bio, stats, gráfico de contribuições, pinned repos.

**Layout:**
1. AppBar: "Meu perfil" + `ti-settings`
2. ProfileHero:
   - Row: avatar-xl (68×68, radius 20, gradient) + nome (24px 600) + handle (mono 13px) + botão "Editar" (outline)
   - Bio: 14px / 1.5 / `--fg-2`
   - Meta row 1: localização + link (com ícones)
   - Meta row 2: **284** seguidores · **132** seguindo · **47** repos (números em bold `--fg`)
3. ContribCard: container surface com:
   - Header: "Contribuições" + "1.284 no último ano"
   - Grid 20 cols × 7 rows = 140 cells (aspect-ratio 20/7), gap 3px, cells radius 3px
   - Cores em 5 níveis de intensidade (light + dark variants — ver Design Tokens)
4. SectionTitle: "Repositórios fixados" + link "Ver todos"
5. PinnedList: cards com `ti-pin-filled` + nome (owner/repo) + descrição + footer mono (lang-dot + estrelas + forks)
6. BottomNav

**Endpoints:**
- `GET /user` (perfil autenticado) ou `GET /users/{username}`
- Contribuições NÃO existem na REST API pública — usar GraphQL `contributionsCollection` ou esconder a card até a query estar disponível
- Pinned repos: GraphQL `user(login).pinnedItems(first: 6)` ou fallback para repos mais starred

---

### 05 · RepoDetailScreen (stack, push)

**Purpose:** detalhes completos de um repositório selecionado.

**Layout:**
1. AppBar com botão voltar + "Repositório" + share + bookmark
2. **DetailHero** (card grande, padding 20, gradiente sutil de `--accent-soft` → `--surface`):
   - Owner row: avatar-md 40×40 + "@facebook · Organization" (mono 13px)
   - Título do repo: 26px 600, letter-spacing -0.025em
   - Descrição: 14px / 1.55
   - Topics: pills mono 11px ("react", "mobile", "ios", "android", "cross-platform")
3. **StatsRow** (grid 3 colunas):
   - Stat: label mono 10px uppercase + número 22px 600 + sub-line "↑ N hoje" em verde
   - Stats: Estrelas, Forks, Watch
4. **InfoRows** (3, cada uma um surface com row layout):
   - Linguagem: `ti-code` + label + lang-dot + nome
   - Licença: `ti-license` + label + valor
   - Último commit: `ti-git-commit` + label + relativo
5. **CTA Primary** (`btn-primary`): "Ver 142 issues abertas" — push para IssuesScreen

**Endpoint:** `GET /repos/{owner}/{repo}`

---

### 06 · IssuesScreen (stack, push)

**Purpose:** lista de issues de um repositório.

**Layout:**
1. AppBar: voltar + "Issues" + `ti-filter`
2. **IssueCount header**: número 32px 600 + dot verde + label mono uppercase "Abertas · {owner}/{repo}"
3. ChipRail: "Abertas · 142" (active), "Fechadas · 8.9k", "Atribuídas a mim", "Boa primeira"
4. **IssueList**: cards com:
   - IssueIcon 28×28 (badge verde com `ti-circle-dot`)
   - Title (14px 500, line-height 1.4)
   - Labels row: pills com dot-bullet (`bug`, `enhancement`, `docs`, `warn`)
   - Meta row mono 11px: `#41234 · há 3 dias · @jamie-dev · 💬 12`

**Endpoint:** `GET /repos/{owner}/{repo}/issues?state=open&per_page=30`

---

### 07 · DesignSystemScreen (stack, dev-only)

**Purpose:** tela "viva" do design system mostrando buttons, inputs, badges, cards, swatches. Útil em dev para QA visual de componentes. **Pode ser excluída do build de produção** — está aqui pra alinhamento dos tokens.

---

## Design Tokens

### Color Tokens

**Light theme:**

| Token | Value |
|---|---|
| `--bg` | `#fbfaf7` (warm off-white) |
| `--surface` | `#ffffff` |
| `--surface-2` | `#f3f1ec` |
| `--border` | `#e7e3da` |
| `--border-strong` | `#d9d4c8` |
| `--fg` | `#1a1a1f` |
| `--fg-2` | `#5b5a55` |
| `--fg-3` | `#8a877f` |
| `--accent` | `oklch(0.55 0.18 275)` (violet-blue) |
| `--accent-soft` | `oklch(0.95 0.04 275)` |
| `--success` | `oklch(0.55 0.14 150)` |
| `--warning` | `oklch(0.60 0.16 60)` |
| `--danger` | `oklch(0.55 0.18 25)` |

**Dark theme:**

| Token | Value |
|---|---|
| `--bg` | `#0e0e12` |
| `--surface` | `#16161c` |
| `--surface-2` | `#1d1d24` |
| `--border` | `#26262f` |
| `--border-strong` | `#34343f` |
| `--fg` | `#f0eee8` |
| `--fg-2` | `#a4a299` |
| `--fg-3` | `#6a6862` |
| `--accent` | `oklch(0.72 0.16 275)` |
| `--accent-soft` | `oklch(0.28 0.08 275)` |
| `--success` | `oklch(0.72 0.16 150)` |
| `--warning` | `oklch(0.78 0.16 70)` |
| `--danger` | `oklch(0.70 0.18 25)` |

> **Sobre oklch em React Native:** RN não suporta `oklch()` diretamente. Converta para hex/rgba antes de usar. Sugestão: gere uma constants/colors.ts com os valores resolvidos. Ferramenta: https://oklch.com/

**Language dots (GitHub palette — mantida por convenção):**

```
TypeScript  #3178c6
JavaScript  #f1e05a
Swift       #f05138
Kotlin      #A97BFF
Rust        #dea584
Go          #00ADD8
Python      #3572A5
```

**Contribution grid (5 intensity levels):**

| Level | Light | Dark |
|---|---|---|
| 0 (empty) | `oklch(0.94 0.01 80)` | `oklch(0.22 0.01 275)` |
| 1 | `oklch(0.88 0.08 275)` | `oklch(0.32 0.08 275)` |
| 2 | `oklch(0.72 0.14 275)` | `oklch(0.50 0.14 275)` |
| 3 | `oklch(0.55 0.18 275)` | `oklch(0.68 0.16 275)` |
| 4 | `oklch(0.42 0.20 275)` | `oklch(0.82 0.18 275)` |

### Typography

- **Geist Sans** — 300, 400, 500, 600, 700 (UI principal)
- **Geist Mono** — 400, 500, 600 (números, handles, código, owner/repo paths, meta info)

Type scale (sizes em pixels):

| Token | Size | Weight | Use |
|---|---|---|---|
| `display` | 32 | 600 | doc title |
| `h1` | 24–26 | 600 | screen title (AppBar h1 = 22) |
| `h2` | 18–20 | 600 | section heading |
| `body-lg` | 14–15 | 500–600 | repo names, issue titles |
| `body` | 13–14 | 400 | descrições |
| `body-sm` | 12–13 | 400 | metas legíveis |
| `caption` | 11 | 400–500 (mono) | metas, timestamps |
| `eyebrow` | 10 | 500 (mono uppercase, letter-spacing 0.14–0.18em) | section labels |

### Spacing scale

Padrão de spacing (base 4):

```
4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 56
```

Padding padrão de telas: **horizontal 20px**.

### Radius scale

| Use | Value |
|---|---|
| pills/chips/badges | `999px` |
| inputs/buttons sm | `10px` |
| cards/buttons md | `14–16px` |
| modals/heros | `20px` |
| device frame | `28–36px` |
| avatar (sm) | `10px` |
| avatar (md/lg) | `12–20px` |
| contrib cell | `3px` |

### Iconography

Tabler Icons. Use o pacote `@tabler/icons-react-native`. Lista de ícones usados nos mockups:

```
ti-search, ti-x, ti-adjustments-horizontal, ti-bell, ti-arrow-left,
ti-share-2, ti-bookmark, ti-bookmark-filled, ti-filter, ti-flame,
ti-compass, ti-activity, ti-user, ti-user-filled, ti-settings,
ti-folder-plus, ti-dots, ti-device-mobile, ti-server, ti-tool,
ti-sparkles, ti-star, ti-star-filled, ti-git-fork, ti-git-pull-request,
ti-git-merge, ti-git-commit, ti-tag, ti-package, ti-circle-dot,
ti-message-circle, ti-clock, ti-code, ti-license, ti-map-pin,
ti-link, ti-pin-filled, ti-loader-2, ti-signal-4g, ti-wifi, ti-battery-3,
ti-sun, ti-moon
```

---

## Interactions & Behavior

### Navigation flows

- **ExploreScreen** → tap em RepoCard → push `RepoDetailScreen` (com param `{owner, repo}`)
- **SavedScreen** → tap em CollectionCard → push `CollectionDetailScreen` (não no escopo; lista repos da coleção); tap em RepoCard → `RepoDetailScreen`
- **FeedScreen** → tap em ActivityItem com repo → `RepoDetailScreen`; tap em PR preview → URL externa (browser)
- **ProfileScreen** → tap em PinnedCard → `RepoDetailScreen`; tap em "Editar" → `EditProfileScreen` (não no escopo)
- **RepoDetailScreen** → tap em CTA "Ver issues" → push `IssuesScreen` (com param `{owner, repo}`)
- **IssuesScreen** → tap em IssueCard → URL externa do GitHub (ou `IssueDetailScreen`, não no escopo)

### States por tela

- **Loading:** skeleton dos cards (placeholder cinza com shimmer) ou `loader-row` mostrado entre páginas. Skeleton recomendado para o **primeiro fetch**; loader-row para **infinite scroll**.
- **Empty:** texto centralizado + ícone grande (`ti-search-off`, `ti-bookmark-off`, etc.). Use copy curta: "Nada por aqui ainda", "Salve repositórios para vê-los aqui".
- **Error:** banner discreto no topo da lista (surface vermelho `--danger-soft`) + botão "Tentar novamente".
- **Refresh:** `RefreshControl` nativo no topo da lista, tint do accent.

### Animations & transitions

- **Tab navigation:** fade nativo do React Navigation (200ms)
- **Stack push:** slide horizontal nativo iOS / fade Android
- **Chip selection:** transição de background-color 150ms ease
- **Bottom nav active state:** ícone troca para variante filled + cor para `--fg`; transição instant (sem animação além do estado)
- **Pulse loader:** opacity 0.3 ↔ 1.0, ciclo 1.2s ease-in-out (já no CSS source — replicar com `Animated.loop`)

### Responsive behavior

Os mockups são para mobile portrait (~375×800 viewport). Implementação:
- Garantir SafeAreaView nas bordas (incluindo bottom para bottom nav não colidir com home indicator)
- Suporte landscape: não obrigatório — pode lock portrait via `expo-screen-orientation`

### Theme switching

- Detectar `useColorScheme()` do RN
- Permitir override via setting do usuário (AsyncStorage: `theme: 'light' | 'dark' | 'system'`)
- Tokens devem ser objetos `lightTheme` / `darkTheme` exportados via Context Provider

---

## State Management

### TanStack Query

Uma `queryClient` global no App root, com staleTime padrão de 5 minutos e cache de 30 minutos. Queries sugeridas:

```ts
// Explore
useSearchRepos(query: string)         // GET /search/repositories
useTrendingRepos(language?: string)   // GET /search/repositories?q=stars:>500+created:>recent

// Detail
useRepo(owner: string, repo: string)  // GET /repos/{owner}/{repo}

// Issues
useIssues(owner: string, repo: string, state: 'open' | 'closed')

// Saved
useStarred(username: string)          // GET /users/{username}/starred
useStarRepo()                          // PUT /user/starred/{owner}/{repo}  (mutation)
useUnstarRepo()                        // DELETE  (mutation)

// Feed
useReceivedEvents(username: string)

// Profile
useUser(username: string)             // GET /users/{username} OR /user
```

### Local state (não vai pra API)

- **Coleções de saved**: estado local (AsyncStorage ou MMKV).
  - Shape: `{ id: string; name: string; color: string; icon: string; repoIds: number[] }[]`
- **Tema**: `'light' | 'dark' | 'system'`
- **Search history**: array de últimas N strings buscadas

---

## TypeScript Types — GitHub REST API

Tipos mínimos para os endpoints usados. Para tipos completos, gerar a partir do OpenAPI oficial: https://github.com/github/rest-api-description

```ts
// User
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

// Repository
export interface GitHubRepo {
  id: number;
  name: string;                       // "react-native"
  full_name: string;                  // "facebook/react-native"
  owner: { login: string; avatar_url: string; type: 'User' | 'Organization' };
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
  pushed_at: string;
  updated_at: string;
}

// Search response
export interface SearchReposResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

// Issue
export interface GitHubIssue {
  id: number;
  number: number;                     // 41234
  title: string;
  state: 'open' | 'closed';
  user: { login: string; avatar_url: string };
  labels: { name: string; color: string }[];
  comments: number;
  created_at: string;
  html_url: string;
  pull_request?: object;              // se presente, é PR (filtrar)
}

// Event (feed)
export type GitHubEvent =
  | { id: string; type: 'WatchEvent'; actor: Actor; repo: RepoRef; created_at: string; payload: { action: 'started' } }
  | { id: string; type: 'ForkEvent'; actor: Actor; repo: RepoRef; created_at: string; payload: {} }
  | { id: string; type: 'ReleaseEvent'; actor: Actor; repo: RepoRef; created_at: string; payload: { release: { tag_name: string; name: string; body: string } } }
  | { id: string; type: 'PullRequestEvent'; actor: Actor; repo: RepoRef; created_at: string; payload: { action: 'opened' | 'closed'; pull_request: { number: number; title: string; merged: boolean } } };

interface Actor { id: number; login: string; avatar_url: string; }
interface RepoRef { id: number; name: string; }  // "owner/repo"
```

### Headers padrão

```ts
{
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Authorization': `Bearer ${PAT}`,    // opcional para endpoints públicos, mas sobe rate limit de 60 → 5000/h
}
```

### Rate limiting

- **Sem auth:** 60 req/hora por IP
- **Com PAT:** 5000 req/hora
- Verificar headers `X-RateLimit-Remaining` e `X-RateLimit-Reset` em cada response
- Em produção, considerar OAuth device flow para autenticação do usuário

---

## Assets

Nenhum asset proprietário foi incluído. Tudo no design é gerado por CSS (gradientes para avatares, dots, ícones via Tabler Icons font). Para produção:

- **Avatares reais**: vir da API (`avatar_url` field)
- **Ícones**: pacote `@tabler/icons-react-native` (ou equivalente lucide)
- **Fontes**: Geist e Geist Mono via Google Fonts ou `@vercel/font` no Expo

---

## Files

```
design_handoff_octolens/
├── README.md                                  ← este arquivo
├── octolens-mockups-standalone.html           ← versão self-contained, abre offline em qualquer browser
└── source/
    └── octolens-mockups.html                  ← arquivo HTML original (com dependências CDN)
```

Abra `octolens-mockups-standalone.html` no browser para ver todas as 7 telas em light + dark lado a lado (= 14 mockups). É a referência visual canônica.

---

## Checklist de implementação sugerido

- [ ] Setup do projeto Expo + TypeScript + React Navigation
- [ ] Configurar fonts (Geist + Geist Mono) via `expo-font`
- [ ] Criar `constants/colors.ts` com tokens resolvidos (oklch → hex)
- [ ] Criar `ThemeProvider` + hook `useTheme()`
- [ ] Setup do TanStack Query + axios wrapper com headers GitHub
- [ ] Implementar componentes base (Button, Input, Chip, Card, Avatar, Pill, Badge)
- [ ] Implementar telas tab uma a uma na ordem: Explore → Saved → Feed → Profile
- [ ] Implementar telas stack: RepoDetail → Issues
- [ ] Implementar persistência de coleções (AsyncStorage)
- [ ] Implementar refresh control e infinite scroll
- [ ] Estados de loading/empty/error em cada tela
- [ ] Polish: animações de transição, haptic feedback opcional, deep linking
