import type { ReactNode } from 'react';

import { Button } from '@/presentation/design-system/Button';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  onRetry?: () => void;
}

export function EmptyState({ title, description, action, onRetry }: EmptyStateProps) {
  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="xxxl"
      paddingVertical="huge"
      gap="md"
    >
      <Text variant="h3" color="fgMuted" textAlign="center">
        {title}
      </Text>
      {description !== undefined && (
        <Text variant="bodySmall" color="fgSubtle" textAlign="center">
          {description}
        </Text>
      )}
      {onRetry !== undefined && (
        <Box marginTop="md">
          <Button
            variant="outline"
            size="md"
            onPress={onRetry}
            accessibilityLabel="Tentar novamente"
          >
            Tentar novamente
          </Button>
        </Box>
      )}
      {action !== undefined && <Box marginTop="md">{action}</Box>}
    </Box>
  );
}
