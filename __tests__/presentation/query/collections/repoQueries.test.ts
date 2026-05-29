import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createElement, type ReactNode } from 'react';

import { repoQueries } from '@/presentation/query/collections/repoQueries';
import { container } from 'src/infra/di/container';

import { makeRepository } from '../../../test-utils/fixtures/repository.fixture';

jest.mock('src/infra/di/container', () => ({
  container: {
    searchReposUseCase: { execute: jest.fn() },
    getRepoDetailsUseCase: { execute: jest.fn() },
  },
}));

const searchMock = container.searchReposUseCase.execute as jest.Mock;
const detailsMock = container.getRepoDetailsUseCase.execute as jest.Mock;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('repoQueries.search', () => {
  beforeEach(() => searchMock.mockReset());

  it('is disabled and never calls the use case when query has < 2 chars', () => {
    const { result } = renderHook(() => useInfiniteQuery(repoQueries.search('a')), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('treats whitespace-only query as disabled', () => {
    renderHook(() => useInfiniteQuery(repoQueries.search('   ')), { wrapper: makeWrapper() });
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('transitions loading → success and calls execute with trimmed query and page=1', async () => {
    searchMock.mockResolvedValueOnce({
      items: [makeRepository({ id: 1 })],
      totalCount: 1,
      hasNextPage: false,
    });

    const { result } = renderHook(() => useInfiniteQuery(repoQueries.search('  react  ')), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(searchMock).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 20 });
    expect(result.current.data?.pages[0]?.items[0]?.id).toBe(1);
  });

  it('fetchNextPage calls execute with page=2', async () => {
    searchMock.mockResolvedValueOnce({
      items: [makeRepository({ id: 1 })],
      totalCount: 100,
      hasNextPage: true,
    });
    searchMock.mockResolvedValueOnce({
      items: [makeRepository({ id: 2 })],
      totalCount: 100,
      hasNextPage: false,
    });

    const { result } = renderHook(() => useInfiniteQuery(repoQueries.search('react')), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2));
    expect(searchMock).toHaveBeenNthCalledWith(2, { query: 'react', page: 2, perPage: 20 });
  });
});

describe('repoQueries.details', () => {
  beforeEach(() => detailsMock.mockReset());

  it('is disabled when owner is empty', () => {
    renderHook(() => useQuery(repoQueries.details('', 'bar')), { wrapper: makeWrapper() });
    expect(detailsMock).not.toHaveBeenCalled();
  });

  it('is disabled when repo is empty', () => {
    renderHook(() => useQuery(repoQueries.details('foo', '')), { wrapper: makeWrapper() });
    expect(detailsMock).not.toHaveBeenCalled();
  });

  it('returns repository data on success and calls execute with owner/repo', async () => {
    const expected = makeRepository({ fullName: 'foo/bar' });
    detailsMock.mockResolvedValueOnce(expected);

    const { result } = renderHook(() => useQuery(repoQueries.details('foo', 'bar')), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(detailsMock).toHaveBeenCalledWith({ owner: 'foo', repo: 'bar' });
    expect(result.current.data).toBe(expected);
  });
});
