import { queryOptions } from '@tanstack/react-query';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { queryKeys } from '@/presentation/query/queryKeys';
import { container } from 'src/infra/di/bootstrap';

export const savedQueries = {
  list: () =>
    queryOptions<SavedRepo[]>({
      queryKey: queryKeys.savedRepos(),
      queryFn: () => container.listSavedReposUseCase.execute(),
      staleTime: 0,
    }),

  isSaved: (fullName: string) =>
    queryOptions<boolean>({
      queryKey: queryKeys.isRepoSaved(fullName),
      queryFn: () => container.isRepoSavedUseCase.execute(fullName),
      enabled: fullName.trim().length > 0,
      staleTime: 0,
    }),
};
