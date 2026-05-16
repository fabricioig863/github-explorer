import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';

export interface CountOpenIssuesInput {
  owner: string;
  repo: string;
}

export class CountOpenIssuesUseCase {
  constructor(private readonly issueRepository: IIssueRepository) {}

  async execute(input: CountOpenIssuesInput): Promise<number> {
    const owner = input.owner.trim();
    const repo = input.repo.trim();

    if (!owner || !repo) {
      throw new InvalidQueryError('Owner e nome do repositório são obrigatórios.');
    }

    return this.issueRepository.countOpen({ owner, repo });
  }
}
