# github-explorer

## Instalação

## Stack

## Decisões arquiteturais

## Uso de IA

## Etapas

### Etapa 3 — Application (Use Cases)

#### Arquivos criados

**`src/application/use-cases/`**
- `SearchReposUseCase.ts` (reescrito do zero)
- `GetRepoDetailsUseCase.ts`
- `ListIssuesUseCase.ts`

**`src/domain/errors/`**
- `InvalidQueryError.ts` — extends `DomainError`, `code = 'INVALID_QUERY'`. Lançado pelos use cases em validação de input.

#### Resultado de `pnpm typecheck`

```
> github-explorer@1.0.0 typecheck /Users/fabricio/projects/github-explorer
> tsc --noEmit
```

Exit 0. Zero erros.

#### Resultado de `pnpm lint`

Exit 0. Apenas warnings de deprecation do `eslint-plugin-boundaries` v5→v6 (decisão registrada em `AI_USAGE.md`).

#### Grep de imports em `src/application/`

```
$ grep -rE "^import" src/application/ | grep -v "@/domain"
(vazio)
```

Confirmação: application só importa de `@/domain/*`.

#### Teste de boundaries em `src/application/` (com axios)

Arquivo temporário `src/application/use-cases/_violation.ts`:

```ts
import axios from 'axios';
export const x = axios;
```

Saída de `pnpm lint src/application/use-cases/_violation.ts`:

```
/Users/fabricio/projects/github-explorer/src/application/use-cases/_violation.ts
  1:19  error  Dependencies with module "axios" to elements of origin "external"
               are not allowed in elements of type "application".
               Denied by rule at index 1  boundaries/external

✖ 1 problem (1 error, 0 warnings)
```

Arquivo removido após confirmação.

#### Conteúdo de `SearchReposUseCase.ts`

```ts
import type { Repository } from '@/domain/entities/Repository';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';

export interface SearchReposInput {
  query: string;
  page: number;
  perPage?: number;
}

export class SearchReposUseCase {
  constructor(private readonly repoRepository: IRepoRepository) {}

  async execute(input: SearchReposInput): Promise<PaginatedResult<Repository>> {
    const sanitized = this.sanitize(input.query);
    this.validate(sanitized);

    return this.repoRepository.search({
      query: sanitized,
      page: input.page,
      perPage: input.perPage ?? 20,
    });
  }

  private sanitize(query: string): string {
    return query.trim();
  }

  private validate(query: string): void {
    if (query.length < 2) {
      throw new InvalidQueryError('A busca precisa ter pelo menos 2 caracteres.');
    }
  }
}
```

## O que faria diferente

- Migrar `eslint-plugin-boundaries` de v5 (`boundaries/element-types` + `boundaries/external`) para v6 (`boundaries/dependencies` unificado com object-based selectors). Eliminaria warnings de deprecation.
