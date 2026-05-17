import { createRestyleComponent, createVariant, type VariantProps } from '@shopify/restyle';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import type { Theme } from 'src/infra/theme/lightTheme';

type CardVariant = Exclude<keyof Theme['cardVariants'], 'defaults'>;
type CardBoxProps = VariantProps<Theme, 'cardVariants'> & ComponentProps<typeof Box>;

const CardBox = createRestyleComponent<CardBoxProps, Theme>(
  [createVariant({ themeKey: 'cardVariants' })],
  Box,
);

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
}

export function Card({ children, variant = 'surface', onPress }: CardProps) {
  if (onPress === undefined) {
    return <CardBox variant={variant}>{children}</CardBox>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      accessibilityRole="button"
    >
      <CardBox variant={variant}>{children}</CardBox>
    </Pressable>
  );
}
