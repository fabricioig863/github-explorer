import type { Issue } from '@/domain/entities/Issue';
import type {
  CountOpenIssuesParams,
  IIssueRepository,
  ListIssuesParams,
} from '@/domain/repositories/IIssueRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';
import type { IssueDto } from '@/infrastructure/http/dtos/IssueDto';
import { mapHttpError } from '@/infrastructure/http/errorMapper';
import { httpClient } from '@/infrastructure/http/httpClient';
import { mapIssue } from '@/infrastructure/http/mappers/issueMapper';

interface SearchIssuesCountResponse {
  total_count: number;
}

/**
 * Nota sobre paginação:
 * - GitHub /repos/{owner}/{repo}/issues não retorna total de issues.
 * - hasNextPage usa heurística: items.length === perPage.
 * - totalCount fica undefined — domain modela essa ausência
 *   explicitamente (PaginatedResult.totalCount é opcional).
 *
 * Alternativa mais robusta seria parsear o header Link (rel="next"),
 * mas custo de implementação não compensa pro escopo deste teste.
 */
export class GitHubIssueRepository implements IIssueRepository {
  async list({
    owner,
    repo,
    state,
    page,
    perPage,
  }: ListIssuesParams): Promise<PaginatedResult<Issue>> {
    try {
      const response = await httpClient.get<IssueDto[]>(`/repos/${owner}/${repo}/issues`, {
        params: {
          state,
          page,
          per_page: perPage,
        },
      });

      const issuesOnly = response.data.filter((dto) => !('pull_request' in dto));
      const items = issuesOnly.map(mapIssue);
      const hasNextPage = response.data.length === perPage;

      return { items, hasNextPage };
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
