import type { SavedRepo } from '@/domain/entities/SavedRepo';

export function makeSavedRepo(overrides?: Partial<SavedRepo>): SavedRepo {
  return {
    id: 1,
    fullName: 'facebook/react-native',
    name: 'react-native',
    ownerLogin: 'facebook',
    ownerAvatarUrl: 'https://github.com/facebook.png',
    language: 'TypeScript',
    htmlUrl: 'https://github.com/facebook/react-native',
    savedAt: new Date('2026-05-17T10:00:00Z'),
    ...overrides,
  };
}
