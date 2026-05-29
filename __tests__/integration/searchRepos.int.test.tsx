import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Repository } from '@/domain/entities/Repository';
import { repoQueries } from '@/presentation/query/collections/repoQueries';
import { container } from 'src/infra/di/container';

import { createTestQueryClient } from '../test-utils/renderWithProviders';

jest.mock('src/infra/repositories/fixtures/repos.fixture', () => {
  const items = Array.from({ length: 25 }, (_, idx) => ({
    id: 1000 + idx,
    name: `test-repo-${idx + 1}`,
    fullName: `owner/test-repo-${idx + 1}`,
    owner: {
      id: 1,
      login: 'owner',
      avatarUrl: 'https://example.com/a.png',
      type: 'User' as const,
    },
    description: 'Test fixture repo',
    stars: idx * 10,
    forks: idx,
    watchers: idx,
    openIssuesCount: 0,
    language: 'TypeScript',
    htmlUrl: `https://example.com/owner/test-repo-${idx + 1}`,
    pushedAt: new Date('2026-01-01T00:00:00Z'),
    topics: [],
    license: null,
  }));
  return { REPOS_FIXTURE: items };
});

const { QueryClientProvider, useInfiniteQuery } = require('@tanstack/react-query');

function makeWrapper() {
  const client = createTestQueryClient();
  const { createElement } = require('react');
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('vertical slice: repoQueries.search → SearchReposUseCase → InMemoryRepoRepository', () => {
  let execSpy: jest.SpyInstance;

  beforeEach(() => {
    execSpy = jest.spyOn(container.searchReposUseCase, 'execute');
  });

  afterEach(() => {
    execSpy.mockRestore();
  });

  describe('enabled gate', () => {
    it('com 1 char trimado, NÃO dispara o use case', () => {
      renderHook(() => useInfiniteQuery(repoQueries.search('a')), { wrapper: makeWrapper() });
      expect(execSpy).not.toHaveBeenCalled();
    });

    it('com 0 chars após trim (whitespace), NÃO dispara o use case', () => {
      renderHook(() => useInfiniteQuery(repoQueries.search('   ')), { wrapper: makeWrapper() });
      expect(execSpy).not.toHaveBeenCalled();
    });

    it('com 2+ chars trimados, dispara o use case ponta-a-ponta', async () => {
      const { result } = renderHook(() => useInfiniteQuery(repoQueries.search('test')), {
        wrapper: makeWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 2000 });
      expect(execSpy).toHaveBeenCalledTimes(1);
      expect(result.current.data?.pages[0]?.items.length).toBeGreaterThan(0);
    });
  });

  describe('trim não duplica entre presentation e application', () => {
    it('query "  test  " chega no use case já trimada (single layer de trim)', async () => {
      const { result } = renderHook(() => useInfiniteQuery(repoQueries.search('  test  ')), {
        wrapper: makeWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 2000 });

      const call = execSpy.mock.calls[0]?.[0];
      expect(call?.query).toBe('test');
    });
  });

  describe('fetchNextPage incrementa page e honra contrato PaginatedResult', () => {
    it('cobre página 1 (20 itens, hasNextPage=true) → fetchNextPage → página 2 (5 itens, hasNextPage=false)', async () => {
      const { result } = renderHook(() => useInfiniteQuery(repoQueries.search('test')), {
        wrapper: makeWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 4000 });

      const first = result.current.data?.pages[0];
      expect(first?.items).toHaveLength(20);
      expect(first?.totalCount).toBe(25);
      expect(first?.hasNextPage).toBe(true);

      const sample = first?.items[0] as Repository;
      expect(sample.pushedAt).toBeInstanceOf(Date);
      expect(sample.fullName).toMatch(/^owner\/test-repo-/);
      expect(sample).not.toHaveProperty('pushed_at');
      expect(sample).not.toHaveProperty('full_name');

      await act(async () => {
        await result.current.fetchNextPage();
      });
      await waitFor(() => expect(result.current.data?.pages).toHaveLength(2), { timeout: 4000 });

      expect(execSpy).toHaveBeenCalledTimes(2);
      expect(execSpy.mock.calls[0]?.[0]?.page).toBe(1);
      expect(execSpy.mock.calls[1]?.[0]?.page).toBe(2);

      const last = result.current.data?.pages[1];
      expect(last?.items).toHaveLength(5);
      expect(last?.hasNextPage).toBe(false);
      expect(result.current.hasNextPage).toBe(false);
    });
  });
});
