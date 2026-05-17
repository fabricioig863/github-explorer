import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createElement, type ReactNode } from 'react';

jest.mock('src/infra/di/container', () => ({
  container: {
    searchReposUseCase: { execute: jest.fn() },
    getRepoDetailsUseCase: { execute: jest.fn() },
    listIssuesUseCase: { execute: jest.fn() },
    countOpenIssuesUseCase: { execute: jest.fn() },
    getUserProfileUseCase: { execute: jest.fn() },
    getRecentCommitsUseCase: { execute: jest.fn() },
  },
}));

import { useSearchRepos } from '@/presentation/hooks/useSearchRepos';
import { container } from 'src/infra/di/container';

import { makeRepository } from '../../test-utils/fixtures/repository.fixture';

const executeMock = container.searchReposUseCase.execute as jest.Mock;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('useSearchRepos', () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it('is disabled and never calls the use case when query has < 2 chars', () => {
    const { result } = renderHook(() => useSearchRepos({ query: 'a' }), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(executeMock).not.toHaveBeenCalled();
  });

  it('treats whitespace-only query as disabled', () => {
    renderHook(() => useSearchRepos({ query: '   ' }), { wrapper: makeWrapper() });
    expect(executeMock).not.toHaveBeenCalled();
  });

  it('transitions loading → success and calls execute with trimmed query and page=1', async () => {
    executeMock.mockResolvedValueOnce({
      items: [makeRepository({ id: 1 })],
      totalCount: 1,
      hasNextPage: false,
    });

    const { result } = renderHook(() => useSearchRepos({ query: '  react  ' }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(executeMock).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 20 });
    expect(result.current.data?.pages[0]?.items[0]?.id).toBe(1);
  });

  it('fetchNextPage calls execute with page=2', async () => {
    executeMock.mockResolvedValueOnce({
      items: [makeRepository({ id: 1 })],
      totalCount: 100,
      hasNextPage: true,
    });
    executeMock.mockResolvedValueOnce({
      items: [makeRepository({ id: 2 })],
      totalCount: 100,
      hasNextPage: false,
    });

    const { result } = renderHook(() => useSearchRepos({ query: 'react' }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(2));
    expect(executeMock).toHaveBeenNthCalledWith(2, { query: 'react', page: 2, perPage: 20 });
  });
});
