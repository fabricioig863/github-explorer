import { assertNonEmpty } from '@/application/validation/assertInput';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export class IsRepoSavedUseCase {
  constructor(private readonly savedReposRepository: ISavedReposRepository) {}

  async execute(fullName: string): Promise<boolean> {
    const trimmed = assertNonEmpty(fullName, 'fullName é obrigatório para consultar status.');
    return this.savedReposRepository.isSaved(trimmed);
  }
}
