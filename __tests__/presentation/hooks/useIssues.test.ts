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

import { useIssues } from '@/presentation/hooks/useIssues';
import { container } from 'src/infra/di/container';

import { makeIssue } from '../../test-utils/fixtures/issue.fixture';

const executeMock = container.listIssuesUseCase.execute as jest.Mock;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('useIssues', () => {
  beforeEach(() => executeMock.mockReset());

  it('is disabled when owner or repo are empty', () => {
    renderHook(() => useIssues({ owner: '', repo: '' }), { wrapper: makeWrapper() });
    expect(executeMock).not.toHaveBeenCalled();
  });

  it('defaults state to "open" and forwards owner/repo/page/perPage', async () => {
    executeMock.mockResolvedValueOnce({ items: [makeIssue()], totalCount: 1, hasNextPage: false });

    const { result } = renderHook(() => useIssues({ owner: 'foo', repo: 'bar' }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(executeMock).toHaveBeenCalledWith({
      owner: 'foo',
      repo: 'bar',
      state: 'open',
      page: 1,
      perPage: 20,
    });
  });

  it('forwards explicit state=closed when provided', async () => {
    executeMock.mockResolvedValueOnce({ items: [], totalCount: 0, hasNextPage: false });

    renderHook(() => useIssues({ owner: 'foo', repo: 'bar', state: 'closed' }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(executeMock).toHaveBeenCalled());
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ state: 'closed' }));
  });

  it('fetchNextPage calls execute with page=2 when hasNextPage', async () => {
    executeMock.mockResolvedValueOnce({ items: [makeIssue()], totalCount: 50, hasNextPage: true });
    executeMock.mockResolvedValueOnce({ items: [makeIssue({ id: 99 })], totalCount: 50, hasNextPage: false });

    const { result } = renderHook(() => useIssues({ owner: 'foo', repo: 'bar' }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(2));
    expect(executeMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ page: 2 }));
  });
});
