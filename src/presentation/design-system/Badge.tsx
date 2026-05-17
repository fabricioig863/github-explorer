import type { ReactNode } from 'react';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import type { Theme } from 'src/infra/theme/lightTheme';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  dotColor?: string;
}

const TONE_COLOR: Record<BadgeTone, keyof Theme['colors']> = {
  neutral: 'fgMuted',
  info: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export function Badge({ children, tone = 'neutral', dotColor }: BadgeProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="sm"
      paddingHorizontal="lg"
      paddingVertical="xs"
      borderRadius="pill"
      backgroundColor="surfaceMuted"
      alignSelf="flex-start"
    >
      {dotColor !== undefined ? (
        <Box width={6} height={6} borderRadius="pill" style={{ backgroundColor: dotColor }} />
      ) : (
        <Box width={6} height={6} borderRadius="pill" backgroundColor={TONE_COLOR[tone]} />
      )}
      <Text variant="caption" color="fgMuted">
        {children}
      </Text>
    </Box>
  );
}
