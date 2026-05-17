import type { ReactNode } from 'react';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import type { Theme } from 'src/infra/theme/lightTheme';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** Cor customizada para o dot, sobrescreve tone. Usado em labels do GitHub que têm cor própria. */
  dotColor?: string;
}

const TONE_COLOR: Record<BadgeTone, keyof Theme['colors']> = {
  neutral: 'fgMuted',
  info: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

/**
 * Badge com dot colorido + texto. Tones semânticas ou cor customizada (labels GitHub).
 *
 * @example
 * <Badge tone="danger">bug</Badge>
 * <Badge dotColor="#d73a4a">bug</Badge>
 */
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
