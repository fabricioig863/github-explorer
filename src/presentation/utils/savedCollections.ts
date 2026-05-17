import type { SavedRepo } from '@/domain/entities/SavedRepo';

export type CollectionId = 'mobile' | 'backend' | 'tools' | 'ai-ml';

export interface CollectionMeta {
  id: CollectionId;
  title: string;
  iconColor: string;
  glyph: string;
}

export const COLLECTIONS: readonly CollectionMeta[] = [
  { id: 'mobile', title: 'Mobile', iconColor: '#5B6CFF', glyph: '☰' },
  { id: 'backend', title: 'Backend', iconColor: '#C53030', glyph: '▨' },
  { id: 'tools', title: 'Ferramentas', iconColor: '#2F855A', glyph: '⛭' },
  { id: 'ai-ml', title: 'AI & ML', iconColor: '#B7791F', glyph: '✪' },
] as const;

const LANG_TO_COLLECTION: Record<string, CollectionId> = {
  swift: 'mobile',
  kotlin: 'mobile',
  dart: 'mobile',
  'objective-c': 'mobile',
  java: 'mobile',
  'c++': 'mobile',
  go: 'backend',
  rust: 'backend',
  ruby: 'backend',
  php: 'backend',
  'c#': 'backend',
  elixir: 'backend',
  python: 'backend',
  shell: 'tools',
  makefile: 'tools',
  dockerfile: 'tools',
  'jupyter notebook': 'ai-ml',
};

export function categorize(repo: SavedRepo): CollectionId | null {
  if (repo.language === null) return null;
  return LANG_TO_COLLECTION[repo.language.toLowerCase()] ?? null;
}

export function countByCollection(repos: readonly SavedRepo[]): Record<CollectionId, number> {
  const acc: Record<CollectionId, number> = { mobile: 0, backend: 0, tools: 0, 'ai-ml': 0 };
  for (const repo of repos) {
    const id = categorize(repo);
    if (id !== null) acc[id] += 1;
  }
  return acc;
}

export function reposInCollection(
  repos: readonly SavedRepo[],
  id: CollectionId,
): readonly SavedRepo[] {
  return repos.filter((repo) => categorize(repo) === id);
}
