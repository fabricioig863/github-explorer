import { assertOwnerRepo } from '@/application/validation/assertInput';
import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';

export interface CountOpenIssuesInput {
  owner: string;
  repo: string;
}

export class CountOpenIssuesUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(input: CountOpenIssuesInput): Promise<number> {
    const { owner, repo } = assertOwnerRepo(input.owner, input.repo);

    return this.issueRepository.countOpen({ owner, repo });
  }
}
