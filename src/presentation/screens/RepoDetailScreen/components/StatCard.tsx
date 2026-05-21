import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Box
      flex={1}
      padding="huge"
      borderRadius="xxl"
      backgroundColor="surface"
      borderColor="border"
      borderWidth={1}
      gap="md"
    >
      <Text variant="eyebrow">{label}</Text>
      <Text variant="h1">{value}</Text>
    </Box>
  );
}
