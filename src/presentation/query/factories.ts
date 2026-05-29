import { infiniteQueryOptions, type QueryKey } from '@tanstack/react-query';

import type { PaginatedResult } from '@/domain/repositories/Pagination';

interface PaginatedQueryConfig<T> {
  queryKey: QueryKey;
  fetchPage: (page: number) => Promise<PaginatedResult<T>>;
  enabled?: boolean;
  staleTime?: number;
}

export function paginatedQueryOptions<T>({
  queryKey,
  fetchPage,
  enabled,
  staleTime,
}: PaginatedQueryConfig<T>) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length + 1 : undefined,
    enabled,
    staleTime,
  });
}
