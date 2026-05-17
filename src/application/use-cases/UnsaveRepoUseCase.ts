import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export class UnsaveRepoUseCase {
  constructor(private readonly savedReposRepository: ISavedReposRepository) {}

  async execute(fullName: string): Promise<void> {
    const trimmed = fullName.trim();
    if (trimmed.length === 0) {
      throw new InvalidQueryError('fullName é obrigatório para remover dos salvos.');
    }
    await this.savedReposRepository.unsave(trimmed);
  }
}
