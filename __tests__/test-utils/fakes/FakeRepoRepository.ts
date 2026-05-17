import type { Repository } from '@/domain/entities/Repository';
import type {
  IRepoRepository,
  SearchReposParams,
} from '@/domain/repositories/IRepoRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';

export class FakeRepoRepository implements IRepoRepository {
  search: jest.Mock<Promise<PaginatedResult<Repository>>, [SearchReposParams]>;
  getDetails: jest.Mock<Promise<Repository>, [string, string]>;

  constructor(defaults?: {
    search?: PaginatedResult<Repository>;
    getDetails?: Repository;
  }) {
    const defaultPage: PaginatedResult<Repository> = defaults?.search ?? {
      items: [],
      totalCount: 0,
      hasNextPage: false,
    };
    this.search = jest.fn().mockResolvedValue(defaultPage);
    this.getDetails = jest.fn().mockResolvedValue(defaults?.getDetails);
  }
}
