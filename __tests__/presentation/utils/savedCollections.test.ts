import {
  categorize,
  countByCollection,
  reposInCollection,
  COLLECTIONS,
} from '@/presentation/utils/savedCollections';

import { makeSavedRepo } from '../../test-utils/fixtures/savedRepo.fixture';

describe('savedCollections', () => {
  describe('categorize', () => {
    it('returns null when language is null', () => {
      expect(categorize(makeSavedRepo({ language: null }))).toBeNull();
    });

    it('returns null when language has no mapping', () => {
      expect(categorize(makeSavedRepo({ language: 'TypeScript' }))).toBeNull();
    });

    it('matches Swift/Kotlin/Dart as mobile', () => {
      expect(categorize(makeSavedRepo({ language: 'Swift' }))).toBe('mobile');
      expect(categorize(makeSavedRepo({ language: 'Kotlin' }))).toBe('mobile');
      expect(categorize(makeSavedRepo({ language: 'Dart' }))).toBe('mobile');
    });

    it('matches Go/Rust/Python as backend', () => {
      expect(categorize(makeSavedRepo({ language: 'Go' }))).toBe('backend');
      expect(categorize(makeSavedRepo({ language: 'Rust' }))).toBe('backend');
      expect(categorize(makeSavedRepo({ language: 'Python' }))).toBe('backend');
    });

    it('is case-insensitive', () => {
      expect(categorize(makeSavedRepo({ language: 'swift' }))).toBe('mobile');
      expect(categorize(makeSavedRepo({ language: 'GO' }))).toBe('backend');
    });
  });

  describe('countByCollection', () => {
    it('returns zeros for all collections when input is empty', () => {
      expect(countByCollection([])).toEqual({ mobile: 0, backend: 0, tools: 0, 'ai-ml': 0 });
    });

    it('counts each repo into its category and ignores uncategorized', () => {
      const repos = [
        makeSavedRepo({ id: 1, language: 'Swift' }),
        makeSavedRepo({ id: 2, language: 'Kotlin' }),
        makeSavedRepo({ id: 3, language: 'Go' }),
        makeSavedRepo({ id: 4, language: 'Shell' }),
        makeSavedRepo({ id: 5, language: 'Jupyter Notebook' }),
        makeSavedRepo({ id: 6, language: 'TypeScript' }), // ignored
      ];
      expect(countByCollection(repos)).toEqual({
        mobile: 2,
        backend: 1,
        tools: 1,
        'ai-ml': 1,
      });
    });
  });

  describe('reposInCollection', () => {
    it('filters by collection id', () => {
      const repos = [
        makeSavedRepo({ id: 1, language: 'Swift' }),
        makeSavedRepo({ id: 2, language: 'Go' }),
      ];
      expect(reposInCollection(repos, 'mobile').map((r) => r.id)).toEqual([1]);
      expect(reposInCollection(repos, 'backend').map((r) => r.id)).toEqual([2]);
      expect(reposInCollection(repos, 'tools')).toEqual([]);
    });
  });

  describe('COLLECTIONS metadata', () => {
    it('exposes the four pre-defined collections in order', () => {
      expect(COLLECTIONS.map((c) => c.id)).toEqual(['mobile', 'backend', 'tools', 'ai-ml']);
    });
  });
});
