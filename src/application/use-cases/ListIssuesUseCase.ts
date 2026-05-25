import { assertOwnerRepo } from '@/application/validation/assertInput';
import type { Issue } from '@/domain/entities/Issue';
import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';

export interface ListIssuesInput {
  owner: string;
  repo: string;
  state?: 'open' | 'closed';
  page: number;
  perPage?: number;
}

export class ListIssuesUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(input: ListIssuesInput): Promise<PaginatedResult<Issue>> {
    const { owner, repo } = assertOwnerRepo(input.owner, input.repo);

    return this.issueRepository.list({
      owner,
      repo,
      state: input.state ?? 'open',
      page: input.page,
      perPage: input.perPage ?? 20,
    });
  }
}
