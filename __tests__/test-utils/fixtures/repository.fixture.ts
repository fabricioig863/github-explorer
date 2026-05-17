import type { Owner } from '@/domain/entities/Owner';
import type { Repository } from '@/domain/entities/Repository';

export function makeOwner(overrides?: Partial<Owner>): Owner {
  return {
    id: 1,
    login: 'octocat',
    avatarUrl: 'https://github.com/octocat.png',
    type: 'User',
    ...overrides,
  };
}

export function makeRepository(overrides?: Partial<Repository>): Repository {
  return {
    id: 42,
    name: 'hello-world',
    fullName: 'octocat/hello-world',
    owner: makeOwner(),
    description: 'A sample repository',
    stars: 1234,
    forks: 56,
    watchers: 1234,
    openIssuesCount: 7,
    language: 'TypeScript',
    htmlUrl: 'https://github.com/octocat/hello-world',
    pushedAt: new Date('2026-01-15T10:00:00Z'),
    topics: [],
    license: 'MIT',
    ...overrides,
  };
}
