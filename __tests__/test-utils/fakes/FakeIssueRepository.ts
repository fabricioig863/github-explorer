import type { Issue } from '@/domain/entities/Issue';
import type {
  CountOpenIssuesParams,
  IIssueRepository,
  ListIssuesParams,
} from '@/domain/repositories/IIssueRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';

export class FakeIssueRepository implements IIssueRepository {
  list: jest.Mock<Promise<PaginatedResult<Issue>>, [ListIssuesParams]>;
  countOpen: jest.Mock<Promise<number>, [CountOpenIssuesParams]>;

  constructor(defaults?: {
    list?: PaginatedResult<Issue>;
    countOpen?: number;
  }) {
    const defaultPage: PaginatedResult<Issue> = defaults?.list ?? {
      items: [],
      totalCount: 0,
      hasNextPage: false,
    };
    this.list = jest.fn().mockResolvedValue(defaultPage);
    this.countOpen = jest.fn().mockResolvedValue(defaults?.countOpen ?? 0);
  }
}
