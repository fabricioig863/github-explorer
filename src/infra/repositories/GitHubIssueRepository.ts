import type { Issue } from '@/domain/entities/Issue';
import type {
  CountOpenIssuesParams,
  IIssueRepository,
  ListIssuesParams,
} from '@/domain/repositories/IIssueRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';
import type { IssueDto } from 'src/infra/http/dtos/IssueDto';
import { mapHttpError } from 'src/infra/http/errorMapper';
import { httpClient } from 'src/infra/http/httpClient';
import { mapIssue } from 'src/infra/http/mappers/issueMapper';

interface SearchIssuesResponse {
  total_count: number;
  items: IssueDto[];
}

interface SearchIssuesCountResponse {
  total_count: number;
}

export class GitHubIssueRepository implements IIssueRepository {
  async list({
    owner,
    repo,
    state,
    page,
    perPage,
  }: ListIssuesParams): Promise<PaginatedResult<Issue>> {
    try {
      const response = await httpClient.get<SearchIssuesResponse>('/search/issues', {
        params: {
          q: `repo:${owner}/${repo} type:issue state:${state}`,
          sort: 'created',
          order: 'desc',
          page,
          per_page: perPage,
        },
      });

      const items = response.data.items.map(mapIssue);
      const totalCount = response.data.total_count;
      const hasNextPage = page * perPage < totalCount;

      return { items, totalCount, hasNextPage };
    } catch (err) {
      mapHttpError(err, `Issues de ${owner}/${repo}`);
    }
  }

  async countOpen({ owner, repo }: CountOpenIssuesParams): Promise<number> {
    try {
      const response = await httpClient.get<SearchIssuesCountResponse>('/search/issues', {
        params: {
          q: `repo:${owner}/${repo} type:issue state:open`,
          per_page: 1,
        },
      });
      return response.data.total_count;
    } catch (err) {
      mapHttpError(err, `Contagem de issues de ${owner}/${repo}`);
    }
  }
}
