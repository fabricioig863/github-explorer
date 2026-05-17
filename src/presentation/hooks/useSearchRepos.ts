import { useInfiniteQuery } from '@tanstack/react-query';

import { container } from 'src/infra/di/container';

interface UseSearchReposParams {
  query: string;
}

const PER_PAGE = 20;

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
