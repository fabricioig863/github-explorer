import type { Issue } from '@/domain/entities/Issue';
import type { PaginatedResult } from '@/domain/repositories/Pagination';

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
