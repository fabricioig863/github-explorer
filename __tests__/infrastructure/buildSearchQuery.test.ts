import { buildSearchQuery } from 'src/infra/repositories/GitHubRepoRepository';

describe('buildSearchQuery', () => {
  it('appends in:name,description for a simple single-token term', () => {
    expect(buildSearchQuery('openai-cookbook')).toBe('openai-cookbook in:name,description');
  });

  it('uses repo: qualifier for an owner/repo path', () => {
    expect(buildSearchQuery('openai/openai-cookbook')).toBe('repo:openai/openai-cookbook');
  });

  it('appends in:name,description for a multi-word term (AND on words inside the qualifier)', () => {
    expect(buildSearchQuery('react native debugger')).toBe(
      'react native debugger in:name,description',
    );
  });
});
