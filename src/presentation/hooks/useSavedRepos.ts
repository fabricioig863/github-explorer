import { useQuery } from '@tanstack/react-query';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { container } from 'src/infra/di/container';

export const SAVED_REPOS_QUERY_KEY = ['savedRepos'] as const;

export function useSavedRepos() {
  return useQuery<SavedRepo[]>({
    queryKey: SAVED_REPOS_QUERY_KEY,
    queryFn: () => container.listSavedReposUseCase.execute(),
    staleTime: 0,
  });
}
