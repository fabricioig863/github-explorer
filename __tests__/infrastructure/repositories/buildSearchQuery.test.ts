import { buildSearchQuery } from 'src/infra/repositories/GitHubRepoRepository';

describe('buildSearchQuery', () => {
  describe('formato repo:owner/name', () => {
    it('usa qualificador repo: para owner/repo válido', () => {
      expect(buildSearchQuery('openai/openai-cookbook')).toBe('repo:openai/openai-cookbook');
    });

    it('aceita owner hifenizado', () => {
      expect(buildSearchQuery('expo-cli/expo')).toBe('repo:expo-cli/expo');
    });

    it('faz trim antes de decidir o formato', () => {
      expect(buildSearchQuery('  facebook/react-native  ')).toBe('repo:facebook/react-native');
    });
  });

  describe('formato livre com in:name,description', () => {
    it('anexa qualificador para termo simples', () => {
      expect(buildSearchQuery('openai-cookbook')).toBe('openai-cookbook in:name,description');
    });

    it('anexa qualificador para termo multi-palavra', () => {
      expect(buildSearchQuery('react native debugger')).toBe(
        'react native debugger in:name,description',
      );
    });

    it('trata string vazia como termo simples', () => {
      expect(buildSearchQuery('')).toBe(' in:name,description');
    });

    it('trata whitespace-only como vazio após trim', () => {
      expect(buildSearchQuery('   ')).toBe(' in:name,description');
    });

    it('mais de duas segmentos não é repo path (a/b/c → termo livre)', () => {
      expect(buildSearchQuery('a/b/c')).toBe('a/b/c in:name,description');
    });

    it('trailing slash não é repo path', () => {
      expect(buildSearchQuery('a/')).toBe('a/ in:name,description');
    });

    it('leading slash não é repo path', () => {
      expect(buildSearchQuery('/b')).toBe('/b in:name,description');
    });
  });
});
