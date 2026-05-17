import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Repository } from '@/domain/entities/Repository';
import type { SavedRepo } from '@/domain/entities/SavedRepo';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

const STORAGE_KEY = '@github-explorer:saved-repos:v1';

/**
 * Shape persistido. Date vira string ISO para JSON.stringify funcionar.
 */
interface SavedRepoPersisted {
  id: number;
  fullName: string;
  name: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  language: string | null;
  htmlUrl: string;
  savedAt: string;
}

function fromRepository(repo: Repository): SavedRepo {
  return {
    id: repo.id,
    fullName: repo.fullName,
    name: repo.name,
    ownerLogin: repo.owner.login,
    ownerAvatarUrl: repo.owner.avatarUrl,
    language: repo.language,
    htmlUrl: repo.htmlUrl,
    savedAt: new Date(),
  };
}

function toPersisted(entry: SavedRepo): SavedRepoPersisted {
  return { ...entry, savedAt: entry.savedAt.toISOString() };
}

function fromPersisted(entry: SavedRepoPersisted): SavedRepo {
  return { ...entry, savedAt: new Date(entry.savedAt) };
}

/**
 * Persiste a coleção de saved repos como um único JSON no AsyncStorage.
 * Volume esperado é pequeno (dezenas), então read+write totais não custam.
 */
export class AsyncStorageSavedReposRepository implements ISavedReposRepository {
  async list(): Promise<SavedRepo[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    try {
      const parsed = JSON.parse(raw) as SavedRepoPersisted[];
      return parsed.map(fromPersisted).sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
    } catch {
      // Storage corrompido — começar do zero é mais seguro que lançar.
      return [];
    }
  }

  async save(repo: Repository): Promise<SavedRepo> {
    const current = await this.list();
    const existing = current.find((entry) => entry.fullName === repo.fullName);
    if (existing !== undefined) return existing;

    const entry = fromRepository(repo);
    const next = [entry, ...current];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next.map(toPersisted)));
    return entry;
  }

  async unsave(fullName: string): Promise<void> {
    const current = await this.list();
    const next = current.filter((entry) => entry.fullName !== fullName);
    if (next.length === current.length) return;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next.map(toPersisted)));
  }

  async isSaved(fullName: string): Promise<boolean> {
    const current = await this.list();
    return current.some((entry) => entry.fullName === fullName);
  }
}
