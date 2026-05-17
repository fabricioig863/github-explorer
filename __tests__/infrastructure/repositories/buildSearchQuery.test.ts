import { buildSearchQuery } from 'src/infra/repositories/GitHubRepoRepository';

describe('buildSearchQuery — edge cases', () => {
  it('treats empty string as simple term (no repo path)', () => {
    expect(buildSearchQuery('')).toBe(' in:name,description');
  });

  it('treats whitespace-only input as empty after trim', () => {
    expect(buildSearchQuery('   ')).toBe(' in:name,description');
  });

  it('treats "a/b/c" as a simple term — more than two segments is not a repo path', () => {
    expect(buildSearchQuery('a/b/c')).toBe('a/b/c in:name,description');
  });

  it('treats "a/" (trailing slash) as a simple term', () => {
    expect(buildSearchQuery('a/')).toBe('a/ in:name,description');
  });

  it('treats "/b" (leading slash) as a simple term', () => {
    expect(buildSearchQuery('/b')).toBe('/b in:name,description');
  });

  it('accepts hyphenated owner/repo as a repo path', () => {
    expect(buildSearchQuery('expo-cli/expo')).toBe('repo:expo-cli/expo');
  });

  it('trims surrounding whitespace before deciding the form', () => {
    expect(buildSearchQuery('  facebook/react-native  ')).toBe('repo:facebook/react-native');
  });
});
