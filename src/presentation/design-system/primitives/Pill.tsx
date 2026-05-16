import type { ReactNode } from 'react';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

interface PillProps {
  children: ReactNode;
}

/**
 * Container arredondado neutro — para topics, tags genéricas.
 * Diferente de Badge: sem variants semânticas, sem dot.
 *
 * @example
 * <Pill>react</Pill>
 */
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
