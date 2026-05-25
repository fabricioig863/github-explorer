import { assertNonEmpty } from '@/application/validation/assertInput';
import type { Repository } from '@/domain/entities/Repository';
import type { SavedRepo } from '@/domain/entities/SavedRepo';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export class SaveRepoUseCase {
  constructor(private readonly savedReposRepository: ISavedReposRepository) {}

  async execute(repo: Repository): Promise<SavedRepo> {
    assertNonEmpty(repo.fullName, 'Repositório inválido para salvar.');
    return this.savedReposRepository.save(repo);
  }
}
