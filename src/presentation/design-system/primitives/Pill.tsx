import type { ReactNode } from 'react';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

interface PillProps {
  children: ReactNode;
}

export function Pill({ children }: PillProps) {
  return (
    <Box
      backgroundColor="surfaceMuted"
      paddingHorizontal="lg"
      paddingVertical="xs"
      borderRadius="pill"
      alignSelf="flex-start"
    >
      <Text variant="mono">{children}</Text>
    </Box>
  );
}
