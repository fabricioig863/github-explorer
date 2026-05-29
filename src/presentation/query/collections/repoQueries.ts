import { queryOptions } from '@tanstack/react-query';

import { paginatedQueryOptions } from '@/presentation/query/factories';
import { queryKeys } from '@/presentation/query/queryKeys';
import { container } from 'src/infra/di/container';

const PER_PAGE = 20;
const MIN_QUERY_LENGTH = 2;

export const repoQueries = {
  details: (owner: string, repo: string) =>
    queryOptions({
      queryKey: queryKeys.repoDetails(owner, repo),
      queryFn: () => container.getRepoDetailsUseCase.execute({ owner, repo }),
      enabled: owner.length > 0 && repo.length > 0,
    }),

  search: (rawQuery: string) => {
    const query = rawQuery.trim();
    return paginatedQueryOptions({
      queryKey: queryKeys.searchRepos(query),
      enabled: query.length >= MIN_QUERY_LENGTH,
      fetchPage: (page) => container.searchReposUseCase.execute({ query, page, perPage: PER_PAGE }),
    });
  },
};
