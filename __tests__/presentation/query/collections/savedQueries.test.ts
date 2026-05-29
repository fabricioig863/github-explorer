import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createElement, type ReactNode } from 'react';

jest.mock('src/infra/di/container', () => ({
  container: {
    listSavedReposUseCase: { execute: jest.fn() },
    isRepoSavedUseCase: { execute: jest.fn() },
  },
}));

import { savedQueries } from '@/presentation/query/collections/savedQueries';
import { container } from 'src/infra/di/container';

import { makeSavedRepo } from '../../../test-utils/fixtures/savedRepo.fixture';

const listMock = container.listSavedReposUseCase.execute as jest.Mock;
const isSavedMock = container.isRepoSavedUseCase.execute as jest.Mock;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('savedQueries.list', () => {
  beforeEach(() => listMock.mockReset());

  it('returns the saved repos and delegates to the use case', async () => {
    const repos = [makeSavedRepo({ fullName: 'foo/bar' })];
    listMock.mockResolvedValueOnce(repos);

    const { result } = renderHook(() => useQuery(savedQueries.list()), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe(repos);
  });
});

describe('savedQueries.isSaved', () => {
  beforeEach(() => isSavedMock.mockReset());

  it('is disabled when fullName is empty', () => {
    renderHook(() => useQuery(savedQueries.isSaved('')), { wrapper: makeWrapper() });
    expect(isSavedMock).not.toHaveBeenCalled();
  });

  it('is disabled when fullName is whitespace only', () => {
    renderHook(() => useQuery(savedQueries.isSaved('   ')), { wrapper: makeWrapper() });
    expect(isSavedMock).not.toHaveBeenCalled();
  });

  it('returns the saved flag and calls execute with fullName', async () => {
    isSavedMock.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useQuery(savedQueries.isSaved('foo/bar')), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(isSavedMock).toHaveBeenCalledWith('foo/bar');
    expect(result.current.data).toBe(true);
  });
});
