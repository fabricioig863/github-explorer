# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Expo SDK 54, React Native 0.81, React 19, TypeScript strict (`noUncheckedIndexedAccess`, `noImplicitOverride`). Package manager: **pnpm 10** (do not use npm/yarn — `pnpm-lock.yaml` is authoritative and `package.json#packageManager` is pinned).

## Commands

```bash
pnpm install
pnpm start                # Metro
pnpm ios | pnpm android | pnpm web
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint flat config (boundaries enforced)
pnpm lint:fix
pnpm format               # prettier
pnpm test                 # full suite
pnpm test:unit            # excludes *.int.test.*
pnpm test:int             # only *.int.test.*  (boundary + slice)
pnpm test:coverage        # enforces thresholds
pnpm test:watch
```

Single test file: `pnpm test path/to/file.test.ts`. Single test name: `pnpm test -t "name pattern"`.

## Architecture

Four-layer Clean Architecture. **Dependency rule points inward and is enforced by `eslint-plugin-boundaries`** — violations break the build, not just docs.

```
src/domain/        → pure. Zero external imports. Entities, repository interfaces, DomainError hierarchy.
src/application/   → use cases. Only imports @/domain. No HTTP, no React.
src/infra/         → adapters. axios, AsyncStorage, React Navigation, Restyle, React Query setup.
src/presentation/  → screens, components, hooks (React Query wrappers), design-system, utils.
```

Boundaries config (`eslint.config.js`) declares `src/infra/navigation/**` as its own element **before** `src/infra/**` — order matters because boundaries matches first hit. `domain` and `application` also forbid **all external packages** (`boundaries/external`).

### Non-obvious placements

- **Navigation lives in `src/infra/navigation/`, NOT `presentation/`.** React Navigation is treated as an external framework adapter. Screens consume route prop types (`ExploreStackScreenProps`) but never assemble the route tree.
- **React Query setup (`QueryClient`, `QueryProvider`) lives in `src/infra/query/`.** Hooks in `presentation/hooks/` wrap `useQuery`/`useInfiniteQuery` against the composition root.
- **Composition root is a single file: `src/infra/di/container.ts`.** Mock vs real HTTP toggles on `EXPO_PUBLIC_USE_MOCK`. Use cases never instantiate repositories — they receive interfaces via constructor.
- **DTOs/Mappers at HTTP boundary.** `src/infra/http/dtos/*Dto.ts` holds snake_case raw shapes; `src/infra/http/mappers/*.ts` translates to domain entities (camelCase, `Date` instances, `null` propagated — never silently coerced).
- **Errors never leak `AxiosError`.** `src/infra/http/errorMapper.ts#mapHttpError(err, ctx): never` always throws a `DomainError` subclass with a discriminated `code` (`NETWORK_ERROR`, `RATE_LIMIT`, `NOT_FOUND`, `INVALID_QUERY`, `UNEXPECTED`). Rate limit detected via 429 OR 403+`x-ratelimit-remaining=0`.

### Path aliases

`tsconfig.json` + `babel.config.js` define `@/domain`, `@/application`, `@/infrastructure`, `@/presentation`. **`@/infrastructure` aliases to `src/infra/`** (folder is `infra`, alias is `infrastructure`). The codebase mixes alias and absolute `src/...` imports; both work.

## Testing strategy

Tests live in `__tests__/`, mirroring `src/` layout, plus `__tests__/integration/` and `__tests__/test-utils/` (fakes, fixtures, `jest.setup.ts`, `renderWithProviders`).

Three categories:

| Category | Location | Purpose |
|----------|----------|---------|
| Unit | `__tests__/{domain,application,infrastructure,presentation}/**/*.test.{ts,tsx}` | Isolated with Fakes or mocks |
| Composition slice | `__tests__/integration/*.int.test.tsx` | Real hook → real use case → `InMemory*Repository`. **No** `jest.mock` on container |
| HTTP boundary | `__tests__/infrastructure/**/*.int.test.ts` | Real `GitHubXRepository` + `httpClient` against `msw` (Node XHR-level intercept). `onUnhandledRequest: 'error'` |

Coverage thresholds (`jest.config.js`): global 80/75/80/80; `src/domain/` 100% all axes; `src/application/` 100% (95% branches). `collectCoverageFrom` excludes `InMemory*`, fixtures, theme files, navigation, design-system, reactotron — keep that exclusion list honest when adding new infra code.

`msw@2` needs special wiring already in `jest.config.js` (`moduleNameMapper` overrides for `msw/node` and `msw`; `transformIgnorePatterns` whitelist for ESM transitive deps). If adding msw-dependent packages, expect to extend the whitelist.

## Environment

`.env` (gitignored) toggles runtime behavior. Vars must be prefixed `EXPO_PUBLIC_` to reach the bundle:

- `EXPO_PUBLIC_USE_MOCK` (`true`/`false`) — flips DI container between `InMemory*` and `GitHub*` repos.
- `EXPO_PUBLIC_GITHUB_TOKEN` — optional PAT, raises rate limit to 5000 req/h. **Bundled into JS — only use read-only `public_repo` scope.**
- `EXPO_PUBLIC_PROFILE_USERNAME` — defaults to `octocat`.

## Conventions worth preserving

- Use cases validate/sanitize (trim, min length, defaults like `perPage = 20`) — do **not** duplicate this in hooks. Hooks pass `enabled` only as an optimization.
- `PaginatedResult<T>` derives `hasNextPage` mathematically (`page * perPage < total_count`) — required because `/repos/{owner}/{repo}/issues` mixes PRs; we use `/search/issues` + `type:issue` for clean lists.
- `buildSearchQuery` rewrites `owner/repo` patterns to `q=repo:owner/name` and adds `in:name,description` to free-text searches.
- Adding a new vertical (entity + interface + impl + use cases + hooks + screen) should require **zero edits to existing verticals**. If a change touches multiple verticals' files, reconsider scope.
