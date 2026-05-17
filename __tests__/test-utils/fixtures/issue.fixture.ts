import type { Issue } from '@/domain/entities/Issue';
import type { Label } from '@/domain/entities/Label';

export function makeLabel(overrides?: Partial<Label>): Label {
  return {
    id: 100,
    name: 'bug',
    color: 'd73a4a',
    ...overrides,
  };
}

export function makeIssue(overrides?: Partial<Issue>): Issue {
  return {
    id: 1001,
    number: 12,
    title: 'Something is broken',
    state: 'open',
    author: {
      login: 'octocat',
      avatarUrl: 'https://github.com/octocat.png',
    },
    labels: [makeLabel()],
    commentsCount: 3,
    createdAt: new Date('2026-02-10T09:00:00Z'),
    htmlUrl: 'https://github.com/octocat/hello-world/issues/12',
    ...overrides,
  };
}
