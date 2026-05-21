import { Skeleton } from '@/presentation/design-system/Skeleton';
import { Box } from '@/presentation/design-system/primitives/Box';

export function SavedScreenSkeleton() {
  return (
    <Box paddingHorizontal="huge" gap="huge">
      <Box flexDirection="row" gap="md">
        <Box flex={1}>
          <Skeleton height={140} radius={16} />
        </Box>
        <Box flex={1}>
          <Skeleton height={140} radius={16} />
        </Box>
      </Box>
      <Box flexDirection="row" gap="md">
        <Box flex={1}>
          <Skeleton height={140} radius={16} />
        </Box>
        <Box flex={1}>
          <Skeleton height={140} radius={16} />
        </Box>
      </Box>
      <Box gap="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={68} radius={16} />
        ))}
      </Box>
    </Box>
  );
}
