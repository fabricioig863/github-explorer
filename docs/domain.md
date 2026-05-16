# Camada de Domain

Núcleo puro do app. Apenas TypeScript — zero dependências externas (sem React,
RN, axios, zod, date-fns). Define **entidades**, **contratos de repositório**
e **erros do domínio**. Nenhuma implementação concreta vive aqui.

---

## Princípios

1. **Pureza total**: nenhum `import` para fora de `@/domain/*`. Validado por
   `grep -rE "^import" src/domain/ | grep -v "@/domain"` → saída vazia.
2. **Sem `class` em entidades**: entidades são dados, não comportamento.
   Modeladas como `interface`.
3. **Sem enums TS**: union types literais (`'open' | 'closed'`). Enums geram
   código runtime e têm pegadinhas com `const enum`.
4. **Sem `any`**: estrito. Onde tipo permissivo é necessário, usa `unknown`
   + narrowing.
5. **Sem mappers/DTOs aqui**: tradução API → domínio fica em
   `src/infrastructure/`.
6. **Convenção `I` em interfaces de repositório** (`IRepoRepository`,
   `IIssueRepository`).
7. **Sem barrels `index.ts`**: imports explícitos por arquivo.

---

## Estrutura

```
src/domain/
├── entities/
│   ├── Owner.ts
│   ├── Repository.ts
│   ├── Label.ts
│   └── Issue.ts
├── repositories/
│   ├── Pagination.ts
│   ├── IRepoRepository.ts
│   └── IIssueRepository.ts
└── errors/
    ├── DomainError.ts
    ├── RateLimitError.ts
    ├── NetworkError.ts
    ├── NotFoundError.ts
    └── UnexpectedError.ts
```

---

## Entidades

### `Owner`

Dono de um repositório — usuário ou organização.

| Campo       | Tipo                          | Origem na API GitHub |
| ----------- | ----------------------------- | -------------------- |
| `id`        | `number`                      | `id`                 |
| `login`     | `string`                      | `login`              |
| `avatarUrl` | `string`                      | `avatar_url`         |
| `type`      | `'User' \| 'Organization'`    | `type`               |

### `Repository`

Entidade central. Nomes renomeados do DTO da API para refletir vocabulário do
domínio (`stars` em vez de `stargazers_count`).

| Campo             | Tipo                  | Origem na API GitHub  |
| ----------------- | --------------------- | --------------------- |
| `id`              | `number`              | `id`                  |
| `name`            | `string`              | `name`                |
| `fullName`        | `string`              | `full_name`           |
| `owner`           | `Owner`               | `owner` (aninhada)    |
| `description`     | `string \| null`      | `description`         |
| `stars`           | `number`              | `stargazers_count`    |
| `forks`           | `number`              | `forks_count`         |
| `watchers`        | `number`              | `watchers_count`      |
| `openIssuesCount` | `number`              | `open_issues_count`   |
| `language`        | `string \| null`      | `language`            |
| `htmlUrl`         | `string`              | `html_url`            |
| `pushedAt`        | `Date`                | `pushed_at` (string ISO → `Date`) |

Conversão de `pushed_at` para `Date` ocorre na infrastructure (mapper).
Domain só consome `Date`.

### `Label`

Label de issue.

| Campo   | Tipo     | Notas                          |
| ------- | -------- | ------------------------------ |
| `id`    | `number` |                                |
| `name`  | `string` | ex: `"bug"`                    |
| `color` | `string` | hex **sem** `#`, ex: `"d73a4a"` |

### `Issue`

| Campo           | Tipo                                 | Notas                                                |
| --------------- | ------------------------------------ | ---------------------------------------------------- |
| `id`            | `number`                             |                                                      |
| `number`        | `number`                             | número público, ex: `41234` (`#41234`)               |
| `title`         | `string`                             |                                                      |
| `state`         | `'open' \| 'closed'`                 | union literal                                        |
| `author`        | `Pick<Owner, 'login' \| 'avatarUrl'>` | subconjunto — issue só precisa login + avatar      |
| `labels`        | `Label[]`                            |                                                      |
| `commentsCount` | `number`                             |                                                      |
| `createdAt`     | `Date`                               |                                                      |
| `htmlUrl`       | `string`                             |                                                      |

---

## Contratos de repositório

### `PaginatedResult<T>` (arquivo dedicado)

Tipo genérico de paginação reusado pelos dois repositórios.

```ts
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
}
```

**Decisão**: extraído para `Pagination.ts` em vez de viver dentro de
`IRepoRepository.ts`. Motivo: `IIssueRepository` também precisa de
`PaginatedResult` e não usa nada mais de `IRepoRepository` — manter junto
forçaria acoplamento desnecessário entre os dois contratos.

### `IRepoRepository`

```ts
export interface SearchReposParams {
  query: string;        // termo de busca
  page: number;         // 1-indexed
  perPage: number;      // tamanho da página
}

export interface IRepoRepository {
  search(params: SearchReposParams): Promise<PaginatedResult<Repository>>;
  getDetails(owner: string, repo: string): Promise<Repository>;
}
```

### `IIssueRepository`

```ts
export interface ListIssuesParams {
  owner: string;
  repo: string;
  state: 'open' | 'closed';
  page: number;
  perPage: number;
}

export interface IIssueRepository {
  list(params: ListIssuesParams): Promise<PaginatedResult<Issue>>;
}
```

---

## Erros

### `DomainError` (abstrata)

Base de todos os erros do domínio. Carrega `code: string` discriminador para
casamento exaustivo em use cases / camada de UI.

```ts
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Preserva stack trace em V8/Hermes quando disponível.
    // captureStackTrace não está nos lib types do TS — narrow local
    // evita `any` mantendo strict mode.
    const ErrorCtor = Error as ErrorWithCapture;
    if (typeof ErrorCtor.captureStackTrace === 'function') {
      ErrorCtor.captureStackTrace(this, this.constructor);
    }
  }
}
```

### Erros concretos

| Classe            | `code`                  | Quando lançar                                  |
| ----------------- | ----------------------- | ---------------------------------------------- |
| `RateLimitError`  | `RATE_LIMIT_EXCEEDED`   | API GitHub retornou 403 com rate limit (carrega `resetAt?: Date` opcional) |
| `NetworkError`    | `NETWORK_ERROR`         | Sem conectividade, timeout, DNS                |
| `NotFoundError`   | `NOT_FOUND`             | Recurso inexistente (404 traduzido). Construtor recebe `resource: string` |
| `UnexpectedError` | `UNEXPECTED`            | Catch-all para erros não mapeados              |

Cada `code` usa `as const` → tipo literal preservado, habilita discriminated
unions:

```ts
switch (err.code) {
  case 'RATE_LIMIT_EXCEEDED': /* err.resetAt narrowed */ break;
  case 'NOT_FOUND':           /* ... */ break;
}
```

---

## Regras de dependência

`domain` **não importa nada** fora de `@/domain/*`. Aplicado pelo
`eslint-plugin-boundaries`:

```js
{ from: 'domain', disallow: ['application', 'infrastructure', 'presentation'] }
```

Limitação conhecida: `boundaries` não restringe **pacotes npm externos**.
`no-restricted-imports` para barrar libs externas em `domain` é melhoria futura.

---

## Validação

```bash
pnpm typecheck                                          # zero erros
pnpm lint                                               # zero erros
grep -rE "^import" src/domain/ | grep -v "@/domain"     # saída vazia
```

---

## Próximos passos (consome o domain)

- Mappers DTO → entidades em `src/infrastructure/http/mappers/`
- Implementações `RepoRepositoryHttp` / `IssueRepositoryHttp` em
  `src/infrastructure/repositories/`
- Use cases `SearchRepos`, `GetRepoDetails`, `ListIssues` em
  `src/application/use-cases/` — recebem `IRepoRepository`/`IIssueRepository`
  por injeção
- Tradução de erros HTTP (axios) → `DomainError` concretos no cliente HTTP
