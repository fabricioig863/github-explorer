import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createElement, type ReactNode } from 'react';

jest.mock('src/infra/di/container', () => ({
  container: {
    listIssuesUseCase: { execute: jest.fn() },
    countOpenIssuesUseCase: { execute: jest.fn() },
  },
}));

import { issueQueries } from '@/presentation/query/collections/issueQueries';
import { container } from 'src/infra/di/container';

import { makeIssue } from '../../../test-utils/fixtures/issue.fixture';

const listMock = container.listIssuesUseCase.execute as jest.Mock;
const countMock = container.countOpenIssuesUseCase.execute as jest.Mock;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('issueQueries.list', () => {
  beforeEach(() => listMock.mockReset());

  it('is disabled when owner or repo are empty', () => {
    renderHook(() => useInfiniteQuery(issueQueries.list('', '')), { wrapper: makeWrapper() });
    expect(listMock).not.toHaveBeenCalled();
  });

  it('defaults state to "open" and forwards owner/repo/page/perPage', async () => {
    listMock.mockResolvedValueOnce({ items: [makeIssue()], totalCount: 1, hasNextPage: false });

    const { result } = renderHook(() => useInfiniteQuery(issueQueries.list('foo', 'bar')), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listMock).toHaveBeenCalledWith({
      owner: 'foo',
      repo: 'bar',
      state: 'open',
      page: 1,
      perPage: 20,
    });
  });

  it('forwards explicit state=closed when provided', async () => {
    listMock.mockResolvedValueOnce({ items: [], totalCount: 0, hasNextPage: false });

    renderHook(() => useInfiniteQuery(issueQueries.list('foo', 'bar', 'closed')), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(listMock).toHaveBeenCalled());
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ state: 'closed' }));
  });

  it('fetchNextPage calls execute with page=2 when hasNextPage', async () => {
    listMock.mockResolvedValueOnce({ items: [makeIssue()], totalCount: 50, hasNextPage: true });
    listMock.mockResolvedValueOnce({
      items: [makeIssue({ id: 99 })],
      totalCount: 50,
      hasNextPage: false,
    });

    const { result } = renderHook(() => useInfiniteQuery(issueQueries.list('foo', 'bar')), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(listMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ page: 2 }));
  });
});

describe('issueQueries.openCount', () => {
  beforeEach(() => countMock.mockReset());

  it('is disabled when owner is empty', () => {
    renderHook(() => useQuery(issueQueries.openCount('', 'bar')), { wrapper: makeWrapper() });
    expect(countMock).not.toHaveBeenCalled();
  });

  it('returns count and delegates to use case with owner/repo', async () => {
    countMock.mockResolvedValueOnce(73);

    const { result } = renderHook(() => useQuery(issueQueries.openCount('foo', 'bar')), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(countMock).toHaveBeenCalledWith({ owner: 'foo', repo: 'bar' });
    expect(result.current.data).toBe(73);
  });
});
