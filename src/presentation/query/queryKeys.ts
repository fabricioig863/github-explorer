import type { QueryKey } from '@tanstack/react-query';

/**
 * Fonte única de query keys do app.
 * Consumida pelas query collections e pela mutation de toggle (invalidate).
 *
 * `isRepoSaved` herda o prefixo de `savedRepos` de propósito: assim
 * invalidar `savedRepos()` também invalida os `isSaved` derivados.
 */
export const queryKeys = {
  searchRepos: (query: string): QueryKey => ['searchRepos', query],
  repoDetails: (owner: string, repo: string): QueryKey => ['repoDetails', owner, repo],
  issues: (owner: string, repo: string, state: string): QueryKey => ['issues', owner, repo, state],
  openIssuesCount: (owner: string, repo: string): QueryKey => ['openIssuesCount', owner, repo],
  savedRepos: (): QueryKey => ['savedRepos'],
  isRepoSaved: (fullName: string): QueryKey => ['savedRepos', 'isSaved', fullName],
} as const;
