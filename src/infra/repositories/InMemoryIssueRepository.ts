import type { Issue } from '@/domain/entities/Issue';
import type {
  CountOpenIssuesParams,
  IIssueRepository,
  ListIssuesParams,
} from '@/domain/repositories/IIssueRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';
import { ISSUES_FIXTURE } from 'src/infra/repositories/fixtures/issues.fixture';

const MIN_LATENCY_MS = 300;
const MAX_LATENCY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomLatency(): number {
  return Math.floor(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));
}

export class InMemoryIssueRepository implements IIssueRepository {
  async list(params: ListIssuesParams): Promise<PaginatedResult<Issue>> {
    await delay(randomLatency());

    const { state, page, perPage } = params;

    const filtered = ISSUES_FIXTURE.filter((issue) => issue.state === state);

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const items = filtered.slice(start, end);

    return {
      items,
      totalCount: filtered.length,
      hasNextPage: end < filtered.length,
    };
  }

  async countOpen(_params: CountOpenIssuesParams): Promise<number> {
    await delay(randomLatency());
    return ISSUES_FIXTURE.filter((issue) => issue.state === 'open').length;
  }
}
