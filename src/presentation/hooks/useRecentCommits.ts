import { useQuery } from '@tanstack/react-query';

import type { RecentCommit } from '@/domain/entities/RecentCommit';
import { container } from 'src/infra/di/container';

const TWO_MINUTES = 2 * 60 * 1000;
const DEFAULT_LIMIT = 4;

interface UseRecentCommitsParams {
  username: string;
  limit?: number;
}

export function useRecentCommits({ username, limit = DEFAULT_LIMIT }: UseRecentCommitsParams) {
  return useQuery<RecentCommit[]>({
    queryKey: ['recentCommits', username, limit],
    queryFn: () => container.getRecentCommitsUseCase.execute({ username, limit }),
    staleTime: TWO_MINUTES,
    enabled: username.trim().length > 0,
  });
}
