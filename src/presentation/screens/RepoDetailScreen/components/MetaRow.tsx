import type { ReactNode } from 'react';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

interface MetaRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  isLast?: boolean;
}

export function MetaRow({ icon, label, value, isLast = false }: MetaRowProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="xl"
      paddingHorizontal="huge"
      borderBottomColor="border"
      borderBottomWidth={isLast ? 0 : 1}
    >
      <Box flexDirection="row" alignItems="center" gap="md" style={{ flexShrink: 0 }}>
        {icon}
        <Text variant="bodySmall" color="fg" style={{ fontFamily: 'Geist_500Medium' }}>
          {label}
        </Text>
      </Box>
      {typeof value === 'string' ? (
        <Text
          variant="bodySmall"
          color="fgMuted"
          numberOfLines={1}
          style={{ flexShrink: 1, marginLeft: 12, textAlign: 'right' }}
        >
          {value}
        </Text>
      ) : (
        <Box style={{ flexShrink: 1, marginLeft: 12 }}>{value}</Box>
      )}
    </Box>
  );
}
