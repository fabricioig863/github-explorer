import type { Repository } from '@/domain/entities/Repository';
import type { SavedRepo } from '@/domain/entities/SavedRepo';

export interface ISavedReposRepository {
  list(): Promise<SavedRepo[]>;
  save(repo: Repository): Promise<SavedRepo>;
  unsave(fullName: string): Promise<void>;
  isSaved(fullName: string): Promise<boolean>;
}
