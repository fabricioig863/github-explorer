import type { Repository } from '@/domain/entities/Repository';
import type { IRepoRepository, SearchReposParams } from '@/domain/repositories/IRepoRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';
import type {
  RepositoryDto,
  SearchRepositoriesResponseDto,
} from 'src/infra/http/dtos/RepositoryDto';
import { mapHttpError } from 'src/infra/http/errorMapper';
import { httpClient } from 'src/infra/http/httpClient';
import { mapRepository } from 'src/infra/http/mappers/repositoryMapper';

function looksLikeRepoPath(q: string): boolean {
  const [owner, repo, extra] = q.split('/');
  return (
    owner !== undefined &&
    owner.length > 0 &&
    repo !== undefined &&
    repo.length > 0 &&
    extra === undefined
  );
}

export function buildSearchQuery(rawQuery: string): string {
  const trimmed = rawQuery.trim();
  if (looksLikeRepoPath(trimmed)) {
    return `repo:${trimmed}`;
  }
  return `${trimmed} in:name,description`;
}

export class GitHubRepoRepository implements IRepoRepository {
  async search({ query, page, perPage }: SearchReposParams): Promise<PaginatedResult<Repository>> {
    try {
      const response = await httpClient.get<SearchRepositoriesResponseDto>('/search/repositories', {
        params: {
          q: buildSearchQuery(query),
          sort: 'stars',
          order: 'desc',
          page,
          per_page: perPage,
        },
      });

      const items = response.data.items.map(mapRepository);
      const totalCount = response.data.total_count;
      const hasNextPage = page * perPage < totalCount;

      return { items, totalCount, hasNextPage };
    } catch (err) {
      mapHttpError(err);
    }
  }

  async getDetails(owner: string, repo: string): Promise<Repository> {
    try {
      const response = await httpClient.get<RepositoryDto>(`/repos/${owner}/${repo}`);
      return mapRepository(response.data);
    } catch (err) {
      mapHttpError(err, `Repositório ${owner}/${repo}`);
    }
  }
}
