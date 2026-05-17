import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export class IsRepoSavedUseCase {
  constructor(private readonly savedReposRepository: ISavedReposRepository) {}

  async execute(fullName: string): Promise<boolean> {
    const trimmed = fullName.trim();
    if (trimmed.length === 0) {
      throw new InvalidQueryError('fullName é obrigatório para consultar status.');
    }
    return this.savedReposRepository.isSaved(trimmed);
  }
}
