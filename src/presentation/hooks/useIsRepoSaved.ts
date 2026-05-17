import { useQuery } from '@tanstack/react-query';

import { SAVED_REPOS_QUERY_KEY } from '@/presentation/hooks/useSavedRepos';
import { container } from 'src/infra/di/container';

export function useIsRepoSaved(fullName: string) {
  return useQuery<boolean>({
    queryKey: [...SAVED_REPOS_QUERY_KEY, 'isSaved', fullName],
    queryFn: () => container.isRepoSavedUseCase.execute(fullName),
    enabled: fullName.trim().length > 0,
    staleTime: 0,
  });
}
