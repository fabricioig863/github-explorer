import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

export function TopicPill({ label }: { label: string }) {
  return (
    <Box
      paddingHorizontal="md"
      paddingVertical="xs"
      borderRadius="sm"
      backgroundColor="surface"
      borderColor="border"
      borderWidth={1}
    >
      <Text variant="mono" color="fgMuted">
        {label}
      </Text>
    </Box>
  );
}
