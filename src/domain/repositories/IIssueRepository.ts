import type { Issue } from '@/domain/entities/Issue';
import type { PaginatedResult } from '@/domain/repositories/Pagination';

export interface ListIssuesParams {
  owner: string;
  repo: string;
  state: 'open' | 'closed';
  page: number;
  perPage: number;
}

export interface CountOpenIssuesParams {
  owner: string;
  repo: string;
}

export interface IIssueRepository {
  list(params: ListIssuesParams): Promise<PaginatedResult<Issue>>;
  /**
   * Conta apenas issues abertas (exclui pull requests).
   * GitHub `open_issues_count` em /repos inclui PRs — usar este método
   * pra obter número real de issues via Search API.
   */
  countOpen(params: CountOpenIssuesParams): Promise<number>;
}
