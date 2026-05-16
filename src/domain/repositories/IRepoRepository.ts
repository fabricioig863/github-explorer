import type { Repository } from '@/domain/entities/Repository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';

export interface SearchReposParams {
  query: string;
  page: number;
  perPage: number;
}

export interface IRepoRepository {
  search(params: SearchReposParams): Promise<PaginatedResult<Repository>>;
  getDetails(owner: string, repo: string): Promise<Repository>;
}
