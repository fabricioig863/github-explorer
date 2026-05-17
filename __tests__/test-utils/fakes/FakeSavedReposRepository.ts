import type { Repository } from '@/domain/entities/Repository';
import type { SavedRepo } from '@/domain/entities/SavedRepo';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export class FakeSavedReposRepository implements ISavedReposRepository {
  list: jest.Mock<Promise<SavedRepo[]>, []>;
  save: jest.Mock<Promise<SavedRepo>, [Repository]>;
  unsave: jest.Mock<Promise<void>, [string]>;
  isSaved: jest.Mock<Promise<boolean>, [string]>;

  constructor(defaults?: {
    list?: SavedRepo[];
    save?: SavedRepo;
    isSaved?: boolean;
  }) {
    this.list = jest.fn().mockResolvedValue(defaults?.list ?? []);
    this.save = jest.fn().mockResolvedValue(defaults?.save);
    this.unsave = jest.fn().mockResolvedValue(undefined);
    this.isSaved = jest.fn().mockResolvedValue(defaults?.isSaved ?? false);
  }
}
