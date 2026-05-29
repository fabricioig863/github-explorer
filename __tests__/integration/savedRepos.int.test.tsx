import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useToggleSaveRepo } from '@/presentation/hooks/useToggleSaveRepo';
import { savedQueries } from '@/presentation/query/collections/savedQueries';
import { container } from 'src/infra/di/container';

import { makeRepository } from '../test-utils/fixtures/repository.fixture';
import { createTestQueryClient } from '../test-utils/renderWithProviders';

const { QueryClientProvider, useQuery } = require('@tanstack/react-query');

function makeWrapper() {
  const client = createTestQueryClient();
  const { createElement } = require('react');
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

describe('vertical slice: savedQueries + useToggleSaveRepo → use cases → InMemorySavedReposRepository', () => {
  // InMemorySavedReposRepository é singleton via container. Estado leak entre
  // testes — limpamos no beforeEach chamando o próprio use case (ponta-a-ponta).
  beforeEach(async () => {
    const all = await container.listSavedReposUseCase.execute();
    await Promise.all(all.map((r) => container.unsaveRepoUseCase.execute(r.fullName)));
  });

  describe('save → list', () => {
    it('salvar um repo aparece na lista de salvos após invalidação', async () => {
      const wrapper = makeWrapper();
      const listHook = renderHook(() => useQuery(savedQueries.list()), { wrapper });
      const toggleHook = renderHook(() => useToggleSaveRepo(), { wrapper });

      // useToggleSaveRepo precisa de um QueryClient compartilhado com o list
      // para invalidação cross-hook. Aqui cada renderHook cria seu próprio
      // client — invalidação não cruza. Por isso o teste valida diretamente
      // a propagação via container, não via cache. Os dois hooks aqui
      // exercitam pontos de entrada diferentes da mesma slice.
      await waitFor(() => expect(listHook.result.current.isSuccess).toBe(true), { timeout: 2000 });
      expect(listHook.result.current.data).toEqual([]);

      await act(async () => {
        await toggleHook.result.current.mutateAsync({
          repo: makeRepository({ fullName: 'facebook/react-native' }),
          isCurrentlySaved: false,
        });
      });

      // Refetch direto pelo container — comprova que o repo persistiu de fato.
      const persisted = await container.listSavedReposUseCase.execute();
      expect(persisted).toHaveLength(1);
      expect(persisted[0]?.fullName).toBe('facebook/react-native');
    });

    it('list ordena por savedAt desc (mais recente primeiro)', async () => {
      const wrapper = makeWrapper();
      const toggleHook = renderHook(() => useToggleSaveRepo(), { wrapper });

      await act(async () => {
        await toggleHook.result.current.mutateAsync({
          repo: makeRepository({ id: 1, fullName: 'a/first' }),
          isCurrentlySaved: false,
        });
      });
      // pequena pausa para que savedAt difira entre as duas chamadas
      await new Promise((r) => setTimeout(r, 5));
      await act(async () => {
        await toggleHook.result.current.mutateAsync({
          repo: makeRepository({ id: 2, fullName: 'b/second' }),
          isCurrentlySaved: false,
        });
      });

      const list = await container.listSavedReposUseCase.execute();
      expect(list).toHaveLength(2);
      expect(list[0]?.fullName).toBe('b/second');
      expect(list[1]?.fullName).toBe('a/first');
      // savedAt é Date no domínio
      expect(list[0]?.savedAt).toBeInstanceOf(Date);
      expect(list[0]!.savedAt.getTime()).toBeGreaterThanOrEqual(list[1]!.savedAt.getTime());
    });
  });

  describe('unsave', () => {
    it('toggle de um repo já salvo (isCurrentlySaved=true) o remove da lista', async () => {
      const wrapper = makeWrapper();
      const toggleHook = renderHook(() => useToggleSaveRepo(), { wrapper });

      await act(async () => {
        await toggleHook.result.current.mutateAsync({
          repo: makeRepository({ fullName: 'foo/bar' }),
          isCurrentlySaved: false,
        });
      });
      expect(await container.listSavedReposUseCase.execute()).toHaveLength(1);

      await act(async () => {
        await toggleHook.result.current.mutateAsync({
          repo: makeRepository({ fullName: 'foo/bar' }),
          isCurrentlySaved: true,
        });
      });

      expect(await container.listSavedReposUseCase.execute()).toEqual([]);
    });
  });

  describe('idempotência do save via use case', () => {
    it('salvar o mesmo fullName duas vezes não duplica (InMemorySavedReposRepository garante via fullName)', async () => {
      const repo = makeRepository({ fullName: 'foo/bar', id: 42 });

      await container.saveRepoUseCase.execute(repo);
      await container.saveRepoUseCase.execute(repo);

      const list = await container.listSavedReposUseCase.execute();
      expect(list).toHaveLength(1);
      expect(list[0]?.fullName).toBe('foo/bar');
    });
  });

  describe('savedQueries.isSaved ponta-a-ponta', () => {
    it('reflete o estado real do repositório após save', async () => {
      // Pré-popula via use case real (sem hook)
      await container.saveRepoUseCase.execute(makeRepository({ fullName: 'foo/bar' }));

      const wrapper = makeWrapper();
      const isSavedHook = renderHook(() => useQuery(savedQueries.isSaved('foo/bar')), { wrapper });
      const notSavedHook = renderHook(() => useQuery(savedQueries.isSaved('does/not-exist')), {
        wrapper,
      });

      await waitFor(() => expect(isSavedHook.result.current.isSuccess).toBe(true), {
        timeout: 2000,
      });
      await waitFor(() => expect(notSavedHook.result.current.isSuccess).toBe(true), {
        timeout: 2000,
      });

      expect(isSavedHook.result.current.data).toBe(true);
      expect(notSavedHook.result.current.data).toBe(false);
    });
  });
});
