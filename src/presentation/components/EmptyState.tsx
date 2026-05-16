import type { ReactNode } from 'react';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Conteúdo opcional abaixo, normalmente um Button. */
  action?: ReactNode;
}

/**
 * Estado vazio genérico — usado para "sem busca", "sem resultados" e variantes.
 *
 * @example
 * <EmptyState title="Nenhum resultado" description="Tente outra busca." />
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
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
      {action !== undefined && <Box marginTop="md">{action}</Box>}
    </Box>
  );
}
