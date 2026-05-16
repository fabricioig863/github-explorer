import type { Repository } from '@/domain/entities/Repository';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';

export interface GetRepoDetailsInput {
  owner: string;
  repo: string;
}

export class GetRepoDetailsUseCase {
  constructor(private readonly repoRepository: IRepoRepository) {}

  async execute(input: GetRepoDetailsInput): Promise<Repository> {
    const owner = input.owner.trim();
    const repo = input.repo.trim();

    if (!owner || !repo) {
      throw new InvalidQueryError('Owner e nome do repositório são obrigatórios.');
    }

    return this.repoRepository.getDetails(owner, repo);
  }
}
