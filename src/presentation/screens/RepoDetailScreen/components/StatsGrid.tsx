import type { Repository } from '@/domain/entities/Repository';
import { Box } from '@/presentation/design-system/primitives/Box';
import { formatCount } from '@/presentation/utils/formatCount';

import { StatCard } from './StatCard';

export function StatsGrid({ repo }: { repo: Repository }) {
  return (
    <Box flexDirection="row" gap="md">
      <StatCard label="ESTRELAS" value={formatCount(repo.stars)} />
      <StatCard label="FORKS" value={formatCount(repo.forks)} />
      <StatCard label="WATCH" value={formatCount(repo.watchers)} />
    </Box>
  );
}
