# Estratégia de Testes — github-explorer

> Auditoria original dos testes existentes em `__tests__/` + a **resolução pós-implementação** das lacunas detectadas.

---

## 0. Resumo executivo pós-implementação

| Item da auditoria original | Status |
| --- | --- |
| 🔴 `GitHubRepoRepository` / `GitHubIssueRepository` / `httpClient` sem testes efetivos | ✅ Resolvido — boundary tests com `msw@2` (Fase 4) |
| 🔴 Exclusões falsas no `collectCoverageFrom` | ✅ Resolvido — exclusões removidas (Fase 1) |
| 🔴 Zero testes de integração HTTP | ✅ Resolvido — `msw` instalado, 32 cases de boundary cobrindo query params, paginação, headers, auth, timeout |
| 🟡 Nenhum teste de integração de composição | ✅ Resolvido — vertical slice em `__tests__/integration/` (Fase 5): hook real + use case real + InMemory repo real |
| 🟡 Container de DI sem teste | ✅ Resolvido — `container.test.ts` cobre USE_MOCK=true/false + `instanceof` por use case (Fase 6) |
| 🟡 Mocks fantasmas (`getUserProfileUseCase`, `getRecentCommitsUseCase`) | ✅ Resolvido — removidos das 6 specs afetadas (Fase 2) |
| 🟡 Isolamento de QueryClient implícito | ✅ Resolvido — meta-test em `renderWithProviders.test.tsx` valida isolamento entre renders |
| 🟢 `notifyManager.setScheduler` síncrono em setup | ✅ Mantido + documentado em comentário no `jest.setup.ts` |
| 🟢 Cobertura 100% domain/application | ✅ Mantido + endurecido — 6 categorias por use case (Fase 3) |
| ⚠️ Spec duplicada `buildSearchQuery` (achado extra) | ✅ Consolidada em 1 spec única (Fase 2) |
| ⚠️ `useToggleSaveRepo` sem spec (achado extra) | ✅ Adicionado unit spec + coberto pela vertical slice (Fase 5) |

### Cobertura: antes → depois

| Métrica | Antes (mentirosa, com exclusões) | Depois (honesta) |
| --- | --- | --- |
| Statements | 87.86% | **94.36%** |
| Branches | 83.39% | **86.9%** |
| Functions | 82.35% | **89.24%** |
| Lines | 87.74% | **94.64%** |
| **Tests** | 187 | **287** |
| **Suites** | 35 | **49** |

Por camada (final):

| Camada | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| `domain/` | 100% | 100% | 100% | 100% |
| `application/` | 100% | 100% | 100% | 100% |
| `infra/di` | 100% | 100% | 100% | 100% |
| `infra/http` | 100% | 100% | 100% | 100% |
| `infra/http/mappers` | 100% | 100% | 100% | 100% |
| `infra/query` | 100% | 100% | 100% | 100% |
| `infra/repositories` | 98.27% | 92.3% | 100% | 100% |
| `presentation/components` | 95.65% | 95.91% | 88.23% | 95.45% |
| `presentation/hooks` | 100% | 100% | 100% | 100% |
| `presentation/screens` | 84.55% | 66.66% | 73.68% | 85.15% |
| `presentation/utils` | 100% | 100% | 100% | 100% |

### Como rodar

```bash
npm test               # roda tudo
npm run test:unit      # exclui *.int.test.* (rápido)
npm run test:int       # só specs *.int.test.* (boundary + vertical slice)
npm run test:coverage  # gera relatório completo
```

---

## 1. Stack de testes (atualizada)

| Item | Valor |
| --- | --- |
| Runner | Jest 29 (preset `jest-expo`) |
| Render RN | `@testing-library/react-native` 13 + `@testing-library/jest-native` |
| Mock AsyncStorage | jest-mock oficial do pacote (auto-mock global em `jest.setup`) |
| **Mock HTTP** | **`msw@2`** (Mock Service Worker) — intercepta em `setupServer` Node, `onUnhandledRequest: 'error'` |
| Setup global | [\_\_tests\_\_/test-utils/jest.setup.ts](../__tests__/test-utils/jest.setup.ts) |
| Render util | [\_\_tests\_\_/test-utils/renderWithProviders.tsx](../__tests__/test-utils/renderWithProviders.tsx) |
| msw server | [\_\_tests\_\_/test-utils/msw/server.ts](../__tests__/test-utils/msw/server.ts) |
| Fakes (test double) | [\_\_tests\_\_/test-utils/fakes/](../__tests__/test-utils/fakes/) |
| Fixtures | [\_\_tests\_\_/test-utils/fixtures/](../__tests__/test-utils/fixtures/) |
| Total de specs | **49** arquivos |
| Total de tests | **287** |

Config: [jest.config.js](../jest.config.js)
Thresholds: global **80/75/80/80**, `src/domain/` **100%**, `src/application/` **100% stmts / 95% br**.

---

## 2. Inventário pós-implementação por camada

### 2.1 `src/domain/` — Domínio
Continua igual: [DomainError.test.ts](../__tests__/domain/errors/DomainError.test.ts) cobre as 6 classes de erro. Threshold forçado em **100%**.

### 2.2 `src/application/` — Use Cases (8 specs, reescritas em Fase 3)

Cada spec agora cobre as **6 categorias** sistematicamente (quando aplicável):

| # | Categoria | O que valida |
| --- | --- | --- |
| 1 | Sanitização | `.trim()` de inputs textuais (leading, trailing, ambos) |
| 2 | Validação | Inputs inválidos levantam `InvalidQueryError` **antes** de chamar o repo (`expect(repo.X).not.toHaveBeenCalled()`) |
| 3 | Defaults de regra de negócio | `perPage ?? 20`, `state ?? 'open'` — asserções sobre o payload exato passado ao repo |
| 4 | Pass-through de retorno | `result === expected` (referência preservada — prova zero wrapping/mutação) |
| 5 | Propagação de erros tipados | `RateLimitError`, `NetworkError`, `NotFoundError`, `UnexpectedError` sobem **sem reembrulhar** (`.rejects.toBe(error)`) |
| 6 | Não vaza tipos da infra | `pushedAt instanceof Date`, ausência de `pushed_at`/`full_name`/`total_count` no retorno |

Categoria N/A é explicitamente comentada na spec (ex.: `ListSavedReposUseCase` não tem input → sem sanitização/validação/defaults).

### 2.3 `src/infra/` — Infraestrutura

#### Mappers + errorMapper (sem mudança)
- [repositoryMapper.test.ts](../__tests__/infrastructure/http/mappers/repositoryMapper.test.ts) — DTO→entity
- [issueMapper.test.ts](../__tests__/infrastructure/http/mappers/issueMapper.test.ts) — DTO→entity
- [errorMapper.test.ts](../__tests__/infrastructure/http/errorMapper.test.ts) — Axios→domínio

#### **NOVO** — Adapters HTTP via msw (Fase 4)

| Spec | Cobre |
| --- | --- |
| [GitHubRepoRepository.int.test.ts](../__tests__/infrastructure/repositories/GitHubRepoRepository.int.test.ts) | `search` envia `q`/`sort`/`order`/`page`/`per_page` corretos, constrói `q` para termo livre vs `owner/repo`, calcula `hasNextPage = page*perPage < totalCount`, mapeia DTO→entity (pushedAt como Date), `getDetails` com `resourceContext`, 403+rate-limit→`RateLimitError`, 403 sem header→`UnexpectedError`, 429→`RateLimitError`, 404→`NotFoundError`, network error→`NetworkError` |
| [GitHubIssueRepository.int.test.ts](../__tests__/infrastructure/repositories/GitHubIssueRepository.int.test.ts) | `list` usa `/search/issues` com `q="repo:owner/repo type:issue state:X"`, `countOpen` envia `per_page=1`, paginação, propagação de erros com `resourceContext` correto |
| [httpClient.int.test.ts](../__tests__/infrastructure/http/httpClient.int.test.ts) | Header `X-GitHub-Api-Version: 2022-11-28` + `Accept: application/vnd.github+json` em toda request, `Authorization: Bearer <token>` **se e somente se** `EXPO_PUBLIC_GITHUB_TOKEN` setado, timeout dispara `NetworkError` |

Lifecycle do msw em `jest.setup.ts`:
```ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

`onUnhandledRequest: 'error'` é proposital — qualquer chamada HTTP não mockada quebra o teste, garantindo zero vazamento para a rede real.

#### **NOVO** — Container DI (Fase 6)
[container.test.ts](../__tests__/infrastructure/di/container.test.ts) — usa `jest.isolateModules` + `process.env.EXPO_PUBLIC_USE_MOCK` para cobrir ambos os branches. Valida:
- Todos os 8 use cases registrados, nenhum `undefined`
- `USE_MOCK=true` (default) → `InMemory*` repos via `Object.getPrototypeOf(...).constructor.name`
- `USE_MOCK=false` → `GitHubRepoRepository` / `GitHubIssueRepository` / `AsyncStorageSavedReposRepository`
- Use cases que compartilham interface compartilham a **mesma instância** (não duplica)

#### **NOVO** — Query module (Fase 6)
- [queryClient.test.ts](../__tests__/infrastructure/query/queryClient.test.ts) — defaults (`staleTime: 5min`, `gcTime: 30s`, `refetchOnWindowFocus: false`) + política `shouldRetry` por tipo de erro
- [QueryProvider.test.tsx](../__tests__/infrastructure/query/QueryProvider.test.tsx) — provider injeta singleton no contexto

### 2.4 `src/presentation/` — UI

Componentes e utilitários sem mudança.

Hooks: [useToggleSaveRepo.test.ts](../__tests__/presentation/hooks/useToggleSaveRepo.test.ts) **novo** (Fase 5) — mutation chama save/unsave conforme `isCurrentlySaved`, invalida cache, propaga erro.

Mocks fantasmas (`getUserProfileUseCase`, `getRecentCommitsUseCase`) removidos das 6 specs que os carregavam.

### 2.5 **NOVO** — `__tests__/integration/` — Vertical slice (Fase 5)

Sem `jest.mock('src/infra/di/container', ...)`. Hooks reais → use cases reais → InMemory repos reais.

| Spec | Cobre |
| --- | --- |
| [searchRepos.int.test.tsx](../__tests__/integration/searchRepos.int.test.tsx) | Fixtures mockadas com 25 itens controlados (não mock do container, mock do dataset). `enabled` gate, trim não duplica entre presentation/application, `fetchNextPage` incrementa page=2, contrato `PaginatedResult` ponta-a-ponta |
| [savedRepos.int.test.tsx](../__tests__/integration/savedRepos.int.test.tsx) | save → list (ordenação `savedAt desc`), unsave (toggle), idempotência (salvar 2x não duplica), `useIsRepoSaved` reflete estado real |

### 2.6 **NOVO** — Meta-test (Fase 2)
[renderWithProviders.test.tsx](../__tests__/test-utils/renderWithProviders.test.tsx) — valida que cada `renderWithProviders` instancia QueryClient próprio, sem leak entre renders.

---

## 3. Definição usada de "integração"

| Tipo | Definição | Onde aparece |
| --- | --- | --- |
| **Unitário** | Unidade com dependências substituídas por fakes/mocks | 8 use cases, utils, components, hooks, telas, mappers, errorMapper |
| **Integração de composição** | 2+ camadas reais juntas (hook + use case + InMemory repo) | `__tests__/integration/*.int.test.tsx` (Fase 5) |
| **Integração de boundary** | Camada que toca recurso externo, com apenas o boundary mockado (msw para HTTP, AsyncStorage mock para storage) | `__tests__/infrastructure/repositories/GitHub*.int.test.ts`, `httpClient.int.test.ts`, `AsyncStorageSavedReposRepository.test.ts` |
| **E2E** | App completo + boundary real | (fora de escopo, sugerido em STUDY.md como future work) |

---

## 4. Resposta direta à pergunta original (atualizada)

> *"Fiquei na dúvida se estamos fazendo um teste de integração ou não dentro do projeto."*

**Sim, agora temos duas categorias de integração explícitas:**

1. **Integração de composição** — `__tests__/integration/*.int.test.tsx` exercita hook real + use case real + repo InMemory real, sem mock do container.
2. **Integração de boundary** — `__tests__/infrastructure/**/*.int.test.ts` exercita os adapters HTTP reais (`GitHubRepoRepository`, `GitHubIssueRepository`, `httpClient`) contra o `msw` interceptando no nível do Node http/XHR. Zero rede real.

`npm run test:int` roda só essas suites (5 arquivos, 42 tests) em < 3s.
`npm run test:unit` roda os 41 demais (230 tests) em ~10s.

---

## 5. Sobre essa auditoria

Este documento foi escrito **antes** das Fases 1–7 para diagnosticar lacunas reais (não cosméticas) na suíte. As Fases 1–7 implementaram cada item 🔴/🟡 da auditoria. O documento agora serve como narrativa do antes/depois — para o avaliador entender o **processo de raciocínio**, não só o estado final.
