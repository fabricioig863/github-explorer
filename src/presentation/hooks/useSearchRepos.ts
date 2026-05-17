import { useInfiniteQuery } from '@tanstack/react-query';

import { container } from 'src/infra/di/container';

interface UseSearchReposParams {
  query: string;
}

const PER_PAGE = 20;

/**
 * Hook de busca paginada de repositórios.
 * Quando query é vazia ou < 2 chars (após trim), fica disabled.
 *
 * @example
 * const { data, fetchNextPage, hasNextPage, isLoading, error } =
 *   useSearchRepos({ query: 'react native' });
 */
export function useSearchRepos({ query }: UseSearchReposParams) {
  const trimmedQuery = query.trim();
  const enabled = trimmedQuery.length >= 2;

  return useInfiniteQuery({
    queryKey: ['searchRepos', trimmedQuery],
    queryFn: ({ pageParam }) =>
      container.searchReposUseCase.execute({
        query: trimmedQuery,
        page: pageParam,
        perPage: PER_PAGE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNextPage) return undefined;
      return allPages.length + 1;
    },
    enabled,
  });
}
