import { queryOptions } from '@tanstack/react-query';

import { paginatedQueryOptions } from '@/presentation/query/factories';
import { queryKeys } from '@/presentation/query/queryKeys';
import { container } from 'src/infra/di/container';

const PER_PAGE = 20;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

type IssueState = 'open' | 'closed';

export const issueQueries = {
  list: (owner: string, repo: string, state: IssueState = 'open') =>
    paginatedQueryOptions({
      queryKey: queryKeys.issues(owner, repo, state),
      enabled: owner.length > 0 && repo.length > 0,
      fetchPage: (page) =>
        container.listIssuesUseCase.execute({ owner, repo, state, page, perPage: PER_PAGE }),
    }),

  openCount: (owner: string, repo: string) =>
    queryOptions({
      queryKey: queryKeys.openIssuesCount(owner, repo),
      queryFn: () => container.countOpenIssuesUseCase.execute({ owner, repo }),
      enabled: owner.length > 0 && repo.length > 0,
      staleTime: FIVE_MINUTES_MS,
    }),
};
