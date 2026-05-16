import { useInfiniteQuery } from '@tanstack/react-query';

import { container } from '@/infrastructure/di/container';

interface UseIssuesParams {
  owner: string;
  repo: string;
  state?: 'open' | 'closed';
}

const PER_PAGE = 20;

/**
 * Hook de listagem paginada de issues. Default state='open'.
 *
 * @example
 * const { data, fetchNextPage, hasNextPage } =
 *   useIssues({ owner: 'facebook', repo: 'react', state: 'open' });
 */
export function useIssues({ owner, repo, state = 'open' }: UseIssuesParams) {
  return useInfiniteQuery({
    queryKey: ['issues', owner, repo, state],
    queryFn: ({ pageParam }) =>
      container.listIssuesUseCase.execute({
        owner,
        repo,
        state,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNextPage) return undefined;
      return allPages.length + 1;
    },
    enabled: owner.length > 0 && repo.length > 0,
  });
}
