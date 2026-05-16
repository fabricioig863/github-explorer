import type { Repository } from '@/domain/entities/Repository';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import type { IRepoRepository, SearchReposParams } from '@/domain/repositories/IRepoRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';
import { REPOS_FIXTURE } from '@/infrastructure/repositories/fixtures/repos.fixture';

const MIN_LATENCY_MS = 300;
const MAX_LATENCY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomLatency(): number {
  return Math.floor(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));
}

export class InMemoryRepoRepository implements IRepoRepository {
  async search({ query, page, perPage }: SearchReposParams): Promise<PaginatedResult<Repository>> {
    await delay(randomLatency());

    const normalizedQuery = query.toLowerCase();
    const filtered = REPOS_FIXTURE.filter((repo) => {
      const nameMatch = repo.name.toLowerCase().includes(normalizedQuery);
      const descMatch = repo.description?.toLowerCase().includes(normalizedQuery) ?? false;
      return nameMatch || descMatch;
    });

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const items = filtered.slice(start, end);

    return {
      items,
      totalCount: filtered.length,
      hasNextPage: end < filtered.length,
    };
  }

  async getDetails(owner: string, repo: string): Promise<Repository> {
    await delay(randomLatency());

    const fullName = `${owner}/${repo}`;
    const found = REPOS_FIXTURE.find((r) => r.fullName === fullName);

    if (!found) {
      throw new NotFoundError(`Repositório ${fullName}`);
    }

    return found;
  }
}
