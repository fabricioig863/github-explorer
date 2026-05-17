import type { IssueDto } from 'src/infra/http/dtos/IssueDto';
import { mapIssue } from 'src/infra/http/mappers/issueMapper';

function makeDto(overrides?: Partial<IssueDto>): IssueDto {
  return {
    id: 9001,
    number: 42,
    title: 'Broken thing',
    state: 'open',
    user: {
      login: 'octocat',
      avatar_url: 'https://github.com/octocat.png',
    },
    labels: [
      { id: 1, name: 'bug', color: 'd73a4a' },
      { id: 2, name: 'good first issue', color: '7057ff' },
    ],
    comments: 5,
    created_at: '2026-03-10T08:30:00Z',
    html_url: 'https://github.com/octocat/repo/issues/42',
    ...overrides,
  };
}

describe('mapIssue', () => {
  it('maps DTO fields to entity, renaming user → author and comments → commentsCount', () => {
    const result = mapIssue(makeDto());
    expect(result).toEqual({
      id: 9001,
      number: 42,
      title: 'Broken thing',
      state: 'open',
      author: {
        login: 'octocat',
        avatarUrl: 'https://github.com/octocat.png',
      },
      labels: [
        { id: 1, name: 'bug', color: 'd73a4a' },
        { id: 2, name: 'good first issue', color: '7057ff' },
      ],
      commentsCount: 5,
      createdAt: new Date('2026-03-10T08:30:00Z'),
      htmlUrl: 'https://github.com/octocat/repo/issues/42',
    });
  });

  it('converts created_at ISO string to Date', () => {
    const result = mapIssue(makeDto({ created_at: '2026-04-01T00:00:00Z' }));
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe('2026-04-01T00:00:00.000Z');
  });

  it('preserves label color hex without "#" prefix', () => {
    const result = mapIssue(
      makeDto({ labels: [{ id: 99, name: 'feature', color: 'a2eeef' }] }),
    );
    expect(result.labels[0]?.color).toBe('a2eeef');
    expect(result.labels[0]?.color).not.toMatch(/^#/);
  });

  it('returns empty labels array when DTO labels is empty', () => {
    const result = mapIssue(makeDto({ labels: [] }));
    expect(result.labels).toEqual([]);
  });

  it('maps closed state', () => {
    const result = mapIssue(makeDto({ state: 'closed' }));
    expect(result.state).toBe('closed');
  });
});
