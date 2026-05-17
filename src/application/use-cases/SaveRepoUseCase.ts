import type { Repository } from '@/domain/entities/Repository';
import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export class SaveRepoUseCase {
  constructor(private readonly savedReposRepository: ISavedReposRepository) {}

  async execute(repo: Repository): Promise<SavedRepo> {
    if (repo.fullName.trim().length === 0) {
      throw new InvalidQueryError('Repositório inválido para salvar.');
    }
    return this.savedReposRepository.save(repo);
  }
}
