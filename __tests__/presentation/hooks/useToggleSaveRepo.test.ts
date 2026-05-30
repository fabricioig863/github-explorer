import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useToggleSaveRepo } from '@/presentation/hooks/useToggleSaveRepo';
import { container } from 'src/infra/di/bootstrap';

import { makeRepository } from '../../test-utils/fixtures/repository.fixture';
import { createTestQueryClient } from '../../test-utils/renderWithProviders';

jest.mock('src/infra/di/bootstrap', () => ({
  container: require('../../test-utils/fakes/makeFakeContainer').makeFakeContainer(),
}));

const saveMock = container.saveRepoUseCase.execute as jest.Mock;
const unsaveMock = container.unsaveRepoUseCase.execute as jest.Mock;

function makeWrapper() {
  const client = createTestQueryClient();
  const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

  const { QueryClientProvider } = require('@tanstack/react-query');
  const { createElement } = require('react');
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);

  return { Wrapper, invalidateSpy };
}

describe('useToggleSaveRepo', () => {
  beforeEach(() => {
    saveMock.mockReset();
    unsaveMock.mockReset();
    saveMock.mockResolvedValue(undefined);
    unsaveMock.mockResolvedValue(undefined);
  });

  it('quando isCurrentlySaved=false, chama saveRepoUseCase e resolve para true', async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useToggleSaveRepo(), { wrapper: Wrapper });

    const repo = makeRepository({ fullName: 'facebook/react-native' });

    await act(async () => {
      await result.current.mutateAsync({ repo, isCurrentlySaved: false });
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith(repo);
    expect(unsaveMock).not.toHaveBeenCalled();
    expect(result.current.data).toBe(true);
  });

  it('quando isCurrentlySaved=true, chama unsaveRepoUseCase com fullName e resolve para false', async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useToggleSaveRepo(), { wrapper: Wrapper });

    const repo = makeRepository({ fullName: 'facebook/react-native' });

    await act(async () => {
      await result.current.mutateAsync({ repo, isCurrentlySaved: true });
    });

    expect(unsaveMock).toHaveBeenCalledTimes(1);
    expect(unsaveMock).toHaveBeenCalledWith('facebook/react-native');
    expect(saveMock).not.toHaveBeenCalled();
    expect(result.current.data).toBe(false);
  });

  it('invalida o cache de savedRepos após sucesso (save ou unsave)', async () => {
    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useToggleSaveRepo(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        repo: makeRepository({ fullName: 'foo/bar' }),
        isCurrentlySaved: false,
      });
    });

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['savedRepos'] }));
  });

  it('propaga erro do use case sem engolir', async () => {
    const err = new Error('disk full');
    saveMock.mockRejectedValueOnce(err);
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useToggleSaveRepo(), { wrapper: Wrapper });

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.mutateAsync({
          repo: makeRepository({ fullName: 'foo/bar' }),
          isCurrentlySaved: false,
        });
      } catch (e) {
        caught = e;
      }
    });

    expect(caught).toBe(err);
  });
});
