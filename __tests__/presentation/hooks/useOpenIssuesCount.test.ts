import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createElement, type ReactNode } from 'react';

jest.mock('src/infra/di/container', () => ({
  container: {
    searchReposUseCase: { execute: jest.fn() },
    getRepoDetailsUseCase: { execute: jest.fn() },
    listIssuesUseCase: { execute: jest.fn() },
    countOpenIssuesUseCase: { execute: jest.fn() },
  },
}));

import { useOpenIssuesCount } from '@/presentation/hooks/useOpenIssuesCount';
import { container } from 'src/infra/di/container';

const executeMock = container.countOpenIssuesUseCase.execute as jest.Mock;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('useOpenIssuesCount', () => {
  beforeEach(() => executeMock.mockReset());

  it('is disabled when owner is empty', () => {
    renderHook(() => useOpenIssuesCount({ owner: '', repo: 'bar' }), { wrapper: makeWrapper() });
    expect(executeMock).not.toHaveBeenCalled();
  });

  it('returns count and delegates to use case with owner/repo', async () => {
    executeMock.mockResolvedValueOnce(73);

    const { result } = renderHook(() => useOpenIssuesCount({ owner: 'foo', repo: 'bar' }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(executeMock).toHaveBeenCalledWith({ owner: 'foo', repo: 'bar' });
    expect(result.current.data).toBe(73);
  });
});
