import { useQuery } from '@tanstack/react-query';

import { container } from 'src/infra/di/container';

interface UseRepoDetailsParams {
  owner: string;
  repo: string;
}

/**
 * Hook de detalhes de um repositório. Desabilitado quando owner ou repo vazios.
 *
 * @example
 * const { data, isLoading, error } = useRepoDetails({ owner: 'facebook', repo: 'react' });
 */
export function useRepoDetails({ owner, repo }: UseRepoDetailsParams) {
  return useQuery({
    queryKey: ['repoDetails', owner, repo],
    queryFn: () => container.getRepoDetailsUseCase.execute({ owner, repo }),
    enabled: owner.length > 0 && repo.length > 0,
  });
}
