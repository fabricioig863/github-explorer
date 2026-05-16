## Decisão: manter ESLint boundaries v5

Após implementar a regra `boundaries/external` (que bloqueia imports de
pacotes npm em camadas do domínio), notei warnings de deprecation
sugerindo migração pra v6 (rule consolidada em `boundaries/dependencies`).

Optei por NÃO migrar nesse momento. Motivos:

1. A configuração atual funciona corretamente — validei com teste de
   violação (import axios em domain bloqueado).
2. Migração de versão major no meio do desenvolvimento adiciona risco
   sem agregar valor funcional.
3. Os warnings não bloqueiam build nem CI.

A migração está registrada como melhoria futura (README "O que faria
diferente com mais tempo").

## Etapa 3 — Application (Use Cases)

- Prompt: gerado em mentoria com Claude
- Executado em: Claude Code
- Arquivos criados:
  - `src/application/use-cases/SearchReposUseCase.ts` (reescrito do zero)
  - `src/application/use-cases/GetRepoDetailsUseCase.ts`
  - `src/application/use-cases/ListIssuesUseCase.ts`
  - `src/domain/errors/InvalidQueryError.ts` (faltava na etapa 2)
- Refinamentos meus sobre o output:
  - Corrigido import de `PaginatedResult`: spec usava
    `@/domain/repositories/IRepoRepository` (que não re-exporta);
    movido para `@/domain/repositories/Pagination`.
  - Removido import `ListIssuesParams` não-utilizado em
    `ListIssuesUseCase` (falharia `@typescript-eslint/no-unused-vars`).
  - Estendido `boundaries/external` no `eslint.config.js` para também
    bloquear externals em `application` (antes só `domain`).
- Validação de boundaries: criado arquivo `_violation.ts` importando
  `axios` em `src/application/use-cases/` — ESLint bloqueou com
  `boundaries/external`. Arquivo removido após confirmação.

## Etapa 5 — Descoberta: boundaries não resolvia path aliases

Durante a implementação do theme, ao rodar teste de boundaries com import
cross-layer usando alias `@/` (ex: `import from '@/presentation/...'`
em arquivo de infrastructure/), descobri que o ESLint não disparava erro.

Investigação: `eslint-plugin-boundaries` precisa de um resolver de imports
para classificar arquivos por camada. Sem resolver de TS aliases, ele só
identificava o tipo "external" (pacotes npm) — não conseguia classificar
imports cross-layer entre camadas internas.

Correção:

1. Instalei `eslint-import-resolver-typescript`
2. Configurei em `eslint.config.js`:
   `settings['import/resolver'].typescript = { project: './tsconfig.json' }`
3. Re-validei: agora `import from '@/presentation/...'` em infrastructure
   dispara erro de boundaries/element-types corretamente.

Implicação: validações de boundaries nas etapas 2, 3 e 4 (domain,
application, infrastructure/repositories) passaram falsamente quando
testadas com imports cross-layer via alias. Os imports de pacotes
externos (axios) sempre funcionaram porque a regra `boundaries/external`
não depende do resolver.

Não houve violação real no código (a estrutura sempre esteve correta),
mas o mecanismo de proteção não estava efetivo. Agora está.

## Etapa 6A — Bug crítico de configuração nativa

Sintoma: dark mode do iOS não trocava o tema do app.

Investigação:

1. Validei JS layer — App.tsx, AppThemeProvider, Box backgroundColor
   todos corretos
2. Adicionei log temporário em AppThemeProvider expondo mode,
   systemScheme, resolvedScheme, isHydrated
3. Descobri que systemScheme sempre retornava 'light' independente
   de toggle de appearance
4. Conclusão JS: pipeline correto, problema na origem do dado
   (camada nativa)
5. Investiguei app.json — encontrei userInterfaceStyle: "light"

Causa: userInterfaceStyle no app.json é config nativa que vira
UIUserInterfaceStyle no Info.plist (iOS) e force o sistema a
sempre reportar light pro JS, independente da preferência real
do usuário.

Solução: trocar pra "automatic". Restart frio do Expo Go
necessário (config nativa não responde a hot reload).

Aprendizado: ao debugar pipelines cross-layer (JS ↔ nativo),
provar correção de uma camada via log permite eliminar hipóteses
e descer na stack. useColorScheme parece "API JS pura" mas
depende de configuração nativa subjacente.

Nota: a mentoria de IA não antecipou esse problema no setup
inicial (etapa 1). Falha identificada e corrigida pelo autor
durante implementação visual.

## Etapa 6B — Refinamento do Button

Durante a etapa, considerei um padrão de Button alternativo (via
TouchableOpacityBox + Record de cores) que vi em [referência:
projeto pessoal anterior / curso X / outro repo].

Analisei a compatibilidade com nossa stack:

- Aproveitei: padrão Record<Variant, Tokens> para mapear cores
  (mais legível que IIFE com if/else)
- Aproveitei: spread de ...rest para props passthrough nativas
- Descartei: TouchableOpacityBox (incompatível — usamos Pressable,
  que é a API moderna do RN)
- Descartei: prop `title: string` (limitante — precisamos suportar
  ícone + texto via children: ReactNode)
- Descartei: tokens gray1/default/padding (do tema do projeto
  original, incompatíveis com nosso tema baseado em Restyle)

Decisão: manter Button com children, variants, sizes, loading,
disabled (atende showcase do PDF) + incorporar padrão Record e
spread (melhoram legibilidade e flexibilidade).

## Etapa 6B — Descoberta: createBox não suporta theme variants

Sintoma: `<Box variant="primary">` falhou no typecheck com
"Property 'variant' does not exist".

Investigação: `createBox<Theme>()` retorna componente com props
de spacing/colors/layout, mas NÃO com `variant` mapeada para
theme.buttonVariants.

Solução: criar wrappers dedicados via `createRestyleComponent` +
`createVariant({ themeKey: 'buttonVariants' })`. Resultado:
`ButtonBox` (em Button.tsx) e `CardBox` (em Card.tsx) que aceitam
`variant` mapeado para o tema.

Aprendizado: documentação do Restyle não deixa claro que createBox
e variant theming são features separadas. createBox cobre layout
primitivo; theme variants precisam de createRestyleComponent.

Talking point: "componentes que consomem theme variants são
criados explicitamente via createRestyleComponent + createVariant.
Box primitivo permanece sem variant, separando responsabilidades."

## Decisão revisada: navegação em presentation, não infrastructure

Versão inicial colocou navegação em src/infrastructure/navigation/.
Ao implementar (etapa 7), descobri que ela importa de presentation/screens/
— necessário pra registrar telas no Stack/Tab — violando a regra de
boundaries "infrastructure não importa de presentation".

Solução inicial: exceção no eslint.config.js (element type 'navigation'
inserido antes de 'infrastructure' no pattern matching, permitindo
import cross-layer). Funcionou, mas enfraqueceu o boundaries como
guardião arquitetural.

Revisei com mentor: a regra do boundaries estava certa — navegação
não é infrastructure. Navegação configura fluxo de UI, importa
componentes de UI (telas), e pertence à camada que orquestra UI:
presentation.

Refatorei: movi src/infrastructure/navigation/ → src/presentation/navigation/.
Removi a exceção do eslint.config.js. Boundaries voltou a proteger
infrastructure → presentation sem furos.

Aprendizado: quando a regra de boundaries reclama, ela geralmente
está certa. Buraco controlado em regra arquitetural é cheiro de
estrutura errada disfarçada. Trade-off de "abrir exceção" é sempre
custo de explicação futura — vale mais investir no rearranjo correto.

## Etapa 8 — Hooks React Query + helper de erros

Conexão entre use cases e UI via React Query. Hooks ficam em
src/presentation/hooks/ e consomem use cases via container DI (nunca
instanciam repositório direto).

Arquivos criados:
- `src/infrastructure/query/queryClient.ts` — QueryClient com smart retry
  condicional por tipo de erro do domain
- `src/infrastructure/query/QueryProvider.tsx` — wrapper QueryClientProvider
- `src/presentation/utils/getErrorMessage.ts` — função pura (não-hook) de
  tradução de erros domain → string pt-BR
- `src/presentation/hooks/useSearchRepos.ts` — useInfiniteQuery, enabled
  apenas com query trim ≥ 2 chars
- `src/presentation/hooks/useRepoDetails.ts` — useQuery single
- `src/presentation/hooks/useIssues.ts` — useInfiniteQuery com state
  open/closed (default open)

Decisões:

1. **Smart retry**: `shouldRetry` em `queryClient.ts` não retenta
   `RateLimitError`, `InvalidQueryError`, `NotFoundError` (determinísticos —
   nova tentativa falha de novo e consome rate limit). Retenta 1× pra
   `NetworkError`/`UnexpectedError` (transientes).

2. **`refetchOnWindowFocus: false`**: padrão React Query revalidar ao focar
   é desktop-first. Em mobile, "voltar pro app" não deve disparar requests
   silenciosos — controle via pull-to-refresh manual.

3. **`getErrorMessage` é função pura, não hook**: tradução de erro não
   depende de estado React. Pode ser chamada em render, callback, fora
   de componente. Sem prefixo `use`.

4. **Hooks NÃO transformam dados**: retornam direto o que use case
   retorna. Transformações (formatação de números, traduções de texto)
   ficam em utilitários separados ou no próprio render.

5. **Ordem de providers em App.tsx**: `QueryProvider > AppThemeProvider >
   RootNavigator`. Query primeiro = convenção, qualquer hook em qualquer
   nível pode chamar `useQuery` sem se preocupar com mounting order.

Validações:
- typecheck + lint limpos
- Grep confirmou hooks só importam `@tanstack/react-query` e
  `@/infrastructure/di` (use cases via container)
- Grep confirmou `getErrorMessage` só importa `@/domain/errors/*`
- Boundary test: import de hook em `infrastructure/query/` dispara
  erro de `boundaries/element-types` corretamente

Talking point: separação use case ↔ hook ↔ render. Use case orquestra
domínio sem saber de React. Hook adapta use case ao ciclo de vida React
(cache, retry, loading). Render consome dados puros sem lógica de erro
duplicada — `getErrorMessage` traduz em qualquer ponto.

## Etapa 9 — SearchScreen real com infinite scroll + estados

Substituição do placeholder por tela funcional consumindo
`useSearchRepos`. Tela orquestra estados, componentes renderizam pedaços.

Arquivos criados:
- `src/presentation/hooks/useDebounce.ts` — debounce genérico `useDebounce<T>`
- `src/presentation/components/EmptyState.tsx` — estado vazio reusável
- `src/presentation/components/RepoListItem.tsx` — card de repo (Avatar,
  Star, LanguageDot, Fork)
- `src/presentation/screens/SearchScreen.tsx` — reescrita com FlatList +
  pull-to-refresh + 5 estados

Decisões:

1. **Debounce 300ms**: balanço entre responsividade percebida e taxa de
   request. < 200ms gera muitos requests durante digitação; > 500ms
   parece travado.

2. **`MIN_QUERY_LENGTH = 2`** duplicado entre hook (`enabled`) e tela
   (early return). Não é violação DRY — hook protege requisição, tela
   protege UX (mostra empty state explicativo em vez de spinner).

3. **Ordem de returns**: queryHasMinLength → isLoading → error →
   repos.length === 0 → lista. Cada return mais específico antes do
   mais genérico. Tela como state machine explícita.

4. **`useCallback` em renderItem + handleRepoPress**: FlatList re-renderiza
   filhos quando função inline muda referência a cada render. Em listas
   longas (50+ items), evita perda perceptível de FPS no scroll.

5. **`isFetching && !isFetchingNextPage`** no RefreshControl: separa
   refresh do topo de fetch de próxima página. Sem essa distinção, o
   spinner do topo continua girando quando carrega mais items embaixo.

6. **`formatCount` local em RepoListItem**: 120000 → 120k, 1500 → 1.5k.
   Função pura colocalada com único consumidor. Extrai pra utils
   quando aparecer 2º caller.

7. **`SearchHeader` interno**: componente não exportado, escopo de
   arquivo. Repete em cada return mas evita passar query/setQuery por
   props pra cada variante.

8. **FlatList nativo do RN, não wrapper Restyle**: design system não
   tem List. Justificado — performance de virtualização é otimização
   crítica do FlatList, wrappar acrescenta overhead sem ganho.

9. **`void` em `fetchNextPage()` e `refetch()`**: callbacks fire-and-forget
   no `onEndReached` e `onRefresh`. Project já aceita `no-void` como
   warning. React Query gerencia erro internamente via `error` state.

Validações:
- typecheck + lint limpos (0 errors, 5 warnings — todas no-void aceitas)
- Imports limitados a theme + navigation/types + hooks + design-system +
  components + domain/entities (read-only para tipo Repository)

Talking point: tela como state machine. 5 returns explícitos em ordem
de especificidade. UX consistente: header fixo no topo (Input nunca some)
+ corpo variável (empty/loading/erro/lista). Pull-to-refresh e infinite
scroll com cuidado de distinguir os dois tipos de fetch (topo vs fim).

## Etapa 10 — RepoDetailScreen + IssuesScreen reais

Substituição dos placeholders por telas funcionais consumindo
`useRepoDetails` e `useIssues`. Mesmo pattern de state machine da
SearchScreen.

Dependência adicionada: `date-fns` (`pnpm add date-fns`) — wrapper fino
em `formatRelativeDate` isola a lib do resto do código.

Arquivos criados/modificados:
- `src/presentation/utils/formatRelativeDate.ts` — wrapper sobre
  `formatDistanceToNow` com locale `ptBR` e `addSuffix`. Encapsula a
  dependência: trocar lib (luxon, dayjs) mexe só aqui.
- `src/presentation/components/IssueListItem.tsx` — card de issue:
  título, badges de labels com cor do GitHub, número, data relativa,
  autor. Sem `onPress` (issue não navega — fora do escopo do PDF).
- `src/presentation/screens/RepoDetailScreen.tsx` — hero (avatar + nome
  + descrição), grid de stats (estrelas/forks/watchers), meta (linguagem
  + issues), CTA pra Issues.
- `src/presentation/screens/IssuesScreen.tsx` — FlatList infinita +
  pull-to-refresh + estados, mesmo pattern da SearchScreen.

Decisões:

1. **`state: 'open'` hardcoded em useIssues**: PDF §4.3 não pede toggle
   open/closed. Manter fora do escopo evita controle de UI sem uso real.
   Caso vire requisito, adiciona Tab/Segmented Control + state local.

2. **`dotColor={\`#${label.color}\`}` no Badge**: fixture do domain
   armazena hex sem `#` (decisão da camada GitHub API). Prefixa no ponto
   de renderização, não no parser — domain fica neutro a representação CSS.

3. **`CircleDot` verde indica issue aberta**: convenção visual do
   GitHub. Closed seria `CheckCircle2` em roxo, mas não implementamos
   closed nessa etapa (ver decisão 1).

4. **`formatCount` duplicada entre RepoListItem e RepoDetailScreen**:
   comentário explícito documenta "extract quando aparecer 3º caller".
   Regra-de-três antes de criar utilitário compartilhado — duas
   ocorrências não justificam abstração.

5. **`StatsGrid` em 3 colunas com flex igual**: `flex={1}` em cada
   Box wrapper distribui largura uniforme. Gap entre cards via Box parent.

6. **`data === undefined` após loading sem erro**: estado raro mas TS
   exige checagem. Cai em EmptyState "Repositório não encontrado".

7. **`ScrollView` em RepoDetailScreen, FlatList em IssuesScreen**:
   detalhe tem conteúdo de tamanho fixo, scroll simples basta. Issues
   é lista paginada — virtualização do FlatList é necessária.

8. **`useCallback` em renderItem sem dependências**: `IssueListItem` não
   recebe callbacks externos, então a referência é estável. Mantém
   pattern do SearchScreen pra consistência.

9. **`RepoHero`, `StatsGrid`, `RepoMeta`, `StatCard` colocaladas**:
   subcomponentes de escopo de arquivo (não exportados). Quebra função
   gigante em peças nomeadas sem poluir presentation/components — só
   sobe pra components/ se virar reuse.

10. **`Issue.labels`, `Issue.author` tipos via `Issue` entity**: import
    type-only de `@/domain/entities/Issue` em IssueListItem para tipar a
    prop. Domain entity é fronteira aceita (regra do AGENTS.md).

Validações:
- `pnpm typecheck` — limpo
- `pnpm lint` — 0 errors, 8 warnings (v5→v6 boundaries + no-void aceitos)
- Grep de imports `@/...` em `src/presentation/screens/` excluindo
  `@/presentation`, `@/infrastructure/theme`, `@/domain/entities` —
  retorno vazio. Telas só falam com camadas permitidas.

Talking point: mesmo pattern de state machine da SearchScreen aplicado
em duas telas distintas (detalhe síncrono vs lista paginada). Componentização
intra-arquivo (RepoHero/StatsGrid/RepoMeta) reduz cognitive load sem
inflar a árvore de pasta. Dependência externa (date-fns) entra atrás
de wrapper de uma linha — facil trocar depois.

## Etapa 10b — Fix native-stack v7 (headerBackTitleVisible)

Erro `TS2769` em `ExploreStack.tsx` e `DesignSystemStack.tsx`:
`headerBackTitleVisible` removido em `@react-navigation/native-stack` v7.

Fix: trocar pela API nova `headerBackButtonDisplayMode: 'minimal'`.
Mesmo efeito visual (esconde texto do botão back, mantém chevron).

Aplicado em ambos stacks. `pnpm typecheck` limpo após troca.

## Etapa 11 — DesignSystemScreen (Showcase §4.4)

Substituição do placeholder pela tela showcase completa. Entregável
exigido pelo PDF §4.4 — visualização de todos os componentes do design
system + switch de tema integrado.

Arquivos modificados:
- `src/infrastructure/theme/AppThemeProvider.tsx` — adicionado `export`
  em `ThemeModeContextValue` (era interface privada). Necessário para
  tipar prop `themeMode` no subcomponente.
- `src/presentation/screens/DesignSystemScreen.tsx` — reescrito do zero
  com 9 seções: ThemeMode, Typography, Buttons, Inputs, Badges, Cards,
  Avatars, Primitives, ColorTokens.

Decisões:

1. **`ScrollView` único, seções via `Box gap`**: alternativa a SectionList
   (que pediria headers tipados). Showcase é estático e curto, scroll
   simples vence em simplicidade. Padding/gap consistente via tokens.

2. **Subcomponentes inline (`*Section`, `SectionWrapper`)**: escopo de
   arquivo, zero reuso fora da showcase. Não merece pasta `components/`.
   Decisão idêntica à do RepoDetailScreen (RepoHero, StatsGrid, etc.).

3. **`COLOR_TOKENS` tipado como `{ name: keyof Theme['colors']; label: string }[]`**:
   array fixo, ordem importa para layout do swatch grid. `keyof Theme['colors']`
   garante que mexer no theme (renomear/remover token) quebra TS aqui —
   showcase nunca fica fora de sincronia com o tema real.

4. **Inputs em estado estático via prop**: `value="bad-input"` direto na
   prop, sem `useState`. Showcase mostra aparência, não interação. Evita
   ruído de controlled inputs em uma página puramente visual.

5. **Switch de tema usa o `<Button>` próprio**: regra explícita do spec —
   showcase tem que dogfood do próprio sistema. `variant={mode === X ? 'primary' : 'outline'}`
   sinaliza estado ativo sem precisar de um novo componente Toggle.

6. **`style={{ backgroundColor: theme.colors[token.name] }}` no swatch**:
   cor dinâmica baseada em iteração sobre array de tokens. Restyle não
   aceita propkey dinâmico de `Theme['colors']`. Mesma justificativa que
   LanguageDot e Badge dotColor — exceção limitada e contida.

7. **`ThemeModeContextValue` exportada nominal**: subcomponente
   `ThemeModeSection` recebe `themeMode` por prop em vez de chamar
   `useThemeMode()` direto. Mantém pattern de "container chama hook,
   filho recebe dados" — torna o subcomponente trivialmente testável
   (se um dia testarmos showcase).

8. **Fallback de iniciais demonstrado com URLs inválidas**: `https://invalid.local/x.png`
   força erro de carregamento → Avatar cai no fallback. Cobre 3 casos:
   login com `.` (`dev.lucas` → `DL`), login com `-` (`john-doe` → `JD`),
   login simples (`single` → `S`).

Validações:
- `pnpm typecheck` — limpo
- `pnpm lint` — 0 errors, 8 warnings (v5→v6 boundaries + no-void aceitos,
  mesmo baseline das etapas anteriores)
- Grep:
  ```
  grep -E "^import" src/presentation/screens/DesignSystemScreen.tsx \
    | grep "@/" \
    | grep -v "@/presentation/design-system" \
    | grep -v "@/infrastructure/theme"
  ```
  Retorno vazio. Tela só fala com design-system + theme — zero acesso a
  hooks de dados, use cases ou entities.

Talking point: showcase é vitrine viva — usa o próprio design system
para se renderizar e o próprio AppThemeProvider para alternar tema.
Trocar token de cor no theme reflete imediatamente no swatch grid sem
mudança de código (`keyof Theme['colors']` é a fonte da verdade).
Switch primary/outline em cima do Button já existente prova que o
sistema de variants cobre estados toggleable sem precisar de novo
componente. Mesma decisão de "subcomponentes inline" do RepoDetail —
quando algo nasce com escopo de uma única tela, não cria pasta.
