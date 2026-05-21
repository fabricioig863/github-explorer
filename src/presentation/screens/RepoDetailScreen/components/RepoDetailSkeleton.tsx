import { Skeleton } from '@/presentation/design-system/Skeleton';
import { Box } from '@/presentation/design-system/primitives/Box';

export function RepoDetailSkeleton() {
  return (
    <Box flex={1} backgroundColor="bg" padding="huge" gap="huge">
      <Skeleton height={180} radius={16} />
      <Box flexDirection="row" gap="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} flex={1}>
            <Skeleton height={88} radius={16} />
          </Box>
        ))}
      </Box>
      <Skeleton height={170} radius={16} />
      <Skeleton height={44} radius={8} />
    </Box>
  );
}
