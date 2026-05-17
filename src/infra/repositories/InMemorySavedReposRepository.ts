import type { Repository } from '@/domain/entities/Repository';
import type { SavedRepo } from '@/domain/entities/SavedRepo';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export class InMemorySavedReposRepository implements ISavedReposRepository {
  private entries: SavedRepo[];

  constructor(initial: SavedRepo[] = []) {
    this.entries = [...initial];
  }

  async list(): Promise<SavedRepo[]> {
    return [...this.entries].sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  }

  async save(repo: Repository): Promise<SavedRepo> {
    const existing = this.entries.find((entry) => entry.fullName === repo.fullName);
    if (existing !== undefined) return existing;

    const entry: SavedRepo = {
      id: repo.id,
      fullName: repo.fullName,
      name: repo.name,
      ownerLogin: repo.owner.login,
      ownerAvatarUrl: repo.owner.avatarUrl,
      language: repo.language,
      htmlUrl: repo.htmlUrl,
      savedAt: new Date(),
    };
    this.entries = [entry, ...this.entries];
    return entry;
  }

  async unsave(fullName: string): Promise<void> {
    this.entries = this.entries.filter((entry) => entry.fullName !== fullName);
  }

  async isSaved(fullName: string): Promise<boolean> {
    return this.entries.some((entry) => entry.fullName === fullName);
  }
}
