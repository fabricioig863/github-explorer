import { useQuery } from '@tanstack/react-query';

import { container } from 'src/infra/di/container';

interface UseRepoDetailsParams {
  owner: string;
  repo: string;
}

export function useRepoDetails({ owner, repo }: UseRepoDetailsParams) {
  return useQuery({
    queryKey: ['repoDetails', owner, repo],
    queryFn: () => container.getRepoDetailsUseCase.execute({ owner, repo }),
    enabled: owner.length > 0 && repo.length > 0,
  });
}
