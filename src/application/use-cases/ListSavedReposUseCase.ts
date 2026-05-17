import type { SavedRepo } from '@/domain/entities/SavedRepo';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export class ListSavedReposUseCase {
  constructor(private readonly savedReposRepository: ISavedReposRepository) {}

  async execute(): Promise<SavedRepo[]> {
    return this.savedReposRepository.list();
  }
}
