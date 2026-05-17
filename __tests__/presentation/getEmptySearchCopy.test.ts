import { getEmptySearchCopy } from '@/presentation/utils/getEmptySearchCopy';

describe('getEmptySearchCopy', () => {
  it('returns generic copy for a simple term', () => {
    const { title, description } = getEmptySearchCopy('react native');
    expect(title).toBe('Nenhum repositório encontrado');
    expect(description).toBe('Tente buscar com termos diferentes.');
  });

  it('returns path-aware copy for owner/repo', () => {
    const { title, description } = getEmptySearchCopy('openai/openai-cookbook');
    expect(title).toBe('Nenhum repositório encontrado');
    expect(description).toContain('openai/openai-cookbook');
    expect(description).toContain('owner/repositório');
  });

  it('treats "a/" as a simple term (no trailing segment)', () => {
    const { description } = getEmptySearchCopy('a/');
    expect(description).toBe('Tente buscar com termos diferentes.');
  });

  it('treats "/b" as a simple term (no leading segment)', () => {
    const { description } = getEmptySearchCopy('/b');
    expect(description).toBe('Tente buscar com termos diferentes.');
  });

  it('treats "a/b/c" as a simple term (more than two segments)', () => {
    const { description } = getEmptySearchCopy('a/b/c');
    expect(description).toBe('Tente buscar com termos diferentes.');
  });
});
