import { useQuery } from '@tanstack/react-query';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { container } from 'src/infra/di/container';

export const SAVED_REPOS_QUERY_KEY = ['savedRepos'] as const;

/**
 * Lista os repositórios salvos pelo usuário. Persistência local (AsyncStorage
 * em runtime real, InMemory em mock); refetch é barato e síncrono o suficiente
 * para tratarmos `staleTime: 0`.
 */
export function useSavedRepos() {
  return useQuery<SavedRepo[]>({
    queryKey: SAVED_REPOS_QUERY_KEY,
    queryFn: () => container.listSavedReposUseCase.execute(),
    staleTime: 0,
  });
}
