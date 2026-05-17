import type { RepositoryDto } from 'src/infra/http/dtos/RepositoryDto';
import { mapRepository } from 'src/infra/http/mappers/repositoryMapper';

function makeDto(overrides?: Partial<RepositoryDto>): RepositoryDto {
  return {
    id: 1,
    name: 'hello-world',
    full_name: 'octocat/hello-world',
    owner: {
      id: 100,
      login: 'octocat',
      avatar_url: 'https://github.com/octocat.png',
      type: 'User',
    },
    description: 'Sample repo',
    stargazers_count: 99,
    forks_count: 7,
    watchers_count: 99,
    open_issues_count: 3,
    language: 'TypeScript',
    html_url: 'https://github.com/octocat/hello-world',
    pushed_at: '2026-02-01T10:00:00Z',
    ...overrides,
  };
}

describe('mapRepository', () => {
  it('maps snake_case fields to camelCase entity fields', () => {
    const result = mapRepository(makeDto());
    expect(result).toEqual({
      id: 1,
      name: 'hello-world',
      fullName: 'octocat/hello-world',
      owner: {
        id: 100,
        login: 'octocat',
        avatarUrl: 'https://github.com/octocat.png',
        type: 'User',
      },
      description: 'Sample repo',
      stars: 99,
      forks: 7,
      watchers: 99,
      openIssuesCount: 3,
      language: 'TypeScript',
      htmlUrl: 'https://github.com/octocat/hello-world',
      pushedAt: new Date('2026-02-01T10:00:00Z'),
      topics: [],
      license: null,
    });
  });

  it('defaults topics to [] when DTO omits the field', () => {
    const result = mapRepository(makeDto());
    expect(result.topics).toEqual([]);
  });

  it('forwards topics array when DTO provides one', () => {
    const result = mapRepository(makeDto({ topics: ['react', 'mobile'] }));
    expect(result.topics).toEqual(['react', 'mobile']);
  });

  it('extracts license.name when present', () => {
    const result = mapRepository(makeDto({ license: { name: 'MIT', spdx_id: 'MIT' } }));
    expect(result.license).toBe('MIT');
  });

  it('falls back to null when license is null', () => {
    const result = mapRepository(makeDto({ license: null }));
    expect(result.license).toBeNull();
  });

  it('converts pushed_at ISO string to Date instance', () => {
    const result = mapRepository(makeDto({ pushed_at: '2026-05-17T12:30:00Z' }));
    expect(result.pushedAt).toBeInstanceOf(Date);
    expect(result.pushedAt.toISOString()).toBe('2026-05-17T12:30:00.000Z');
  });

  it('preserves description: null', () => {
    const result = mapRepository(makeDto({ description: null }));
    expect(result.description).toBeNull();
  });

  it('preserves language: null', () => {
    const result = mapRepository(makeDto({ language: null }));
    expect(result.language).toBeNull();
  });

  it('maps Organization owner type', () => {
    const result = mapRepository(
      makeDto({
        owner: {
          id: 200,
          login: 'facebook',
          avatar_url: 'https://github.com/facebook.png',
          type: 'Organization',
        },
      }),
    );
    expect(result.owner.type).toBe('Organization');
  });
});
