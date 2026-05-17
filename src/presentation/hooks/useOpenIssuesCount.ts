import { useQuery } from '@tanstack/react-query';

import { container } from 'src/infra/di/container';

interface UseOpenIssuesCountParams {
  owner: string;
  repo: string;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function useOpenIssuesCount({ owner, repo }: UseOpenIssuesCountParams) {
  return useQuery({
    queryKey: ['openIssuesCount', owner, repo],
    queryFn: () => container.countOpenIssuesUseCase.execute({ owner, repo }),
    enabled: owner.length > 0 && repo.length > 0,
    staleTime: FIVE_MINUTES_MS,
  });
}
