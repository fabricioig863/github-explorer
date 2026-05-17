import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Repository } from '@/domain/entities/Repository';
import { SAVED_REPOS_QUERY_KEY } from '@/presentation/hooks/useSavedRepos';
import { container } from 'src/infra/di/container';

interface ToggleInput {
  repo: Repository;
  isCurrentlySaved: boolean;
}

export function useToggleSaveRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ repo, isCurrentlySaved }: ToggleInput) => {
      if (isCurrentlySaved) {
        await container.unsaveRepoUseCase.execute(repo.fullName);
        return false;
      }
      await container.saveRepoUseCase.execute(repo);
      return true;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SAVED_REPOS_QUERY_KEY });
    },
  });
}
