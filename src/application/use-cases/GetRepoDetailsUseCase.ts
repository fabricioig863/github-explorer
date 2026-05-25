import { assertOwnerRepo } from '@/application/validation/assertInput';
import type { Repository } from '@/domain/entities/Repository';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';

export interface GetRepoDetailsInput {
  owner: string;
  repo: string;
}

export class GetRepoDetailsUseCase {
  constructor(private readonly repoRepository: IRepoRepository) {}

  async execute(input: GetRepoDetailsInput): Promise<Repository> {
    const { owner, repo } = assertOwnerRepo(input.owner, input.repo);

    return this.repoRepository.getDetails(owner, repo);
  }
}
