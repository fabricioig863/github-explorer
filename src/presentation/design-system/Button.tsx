import { createRestyleComponent, createVariant, type VariantProps } from '@shopify/restyle';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Spinner } from '@/presentation/design-system/primitives/Spinner';
import { Text } from '@/presentation/design-system/primitives/Text';
import type { Theme } from 'src/infra/theme/lightTheme';

type ButtonBoxProps = VariantProps<Theme, 'buttonVariants'> & ComponentProps<typeof Box>;
const ButtonBox = createRestyleComponent<ButtonBoxProps, Theme>(
  [createVariant({ themeKey: 'buttonVariants' })],
  Box,
);

type ButtonVariant = Exclude<keyof Theme['buttonVariants'], 'defaults'>;
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ComponentProps<typeof Pressable>, 'children' | 'style'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
}

const TEXT_COLOR: Record<ButtonVariant, keyof Theme['colors']> = {
  primary: 'bg',
  accent: 'accentText',
  outline: 'fg',
  ghost: 'accent',
};

const SIZE_PADDING: Record<
  ButtonSize,
  { horizontal: keyof Theme['spacing']; vertical: keyof Theme['spacing'] }
> = {
  sm: { horizontal: 'lg', vertical: 'sm' },
  md: { horizontal: 'xxl', vertical: 'lg' },
  lg: { horizontal: 'xxxl', vertical: 'xl' },
};

const SIZE_TEXT_VARIANT: Record<ButtonSize, 'bodySmall' | 'body' | 'h3'> = {
  sm: 'bodySmall',
  md: 'body',
  lg: 'h3',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizing = SIZE_PADDING[size];
  const textColor = TEXT_COLOR[variant];

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => ({
        opacity: pressed && !isDisabled ? 0.85 : disabled ? 0.5 : 1,
      })}
      {...rest}
    >
      <ButtonBox
        variant={variant}
        paddingHorizontal={sizing.horizontal}
        paddingVertical={sizing.vertical}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="sm"
      >
        {loading ? (
          <Spinner size="small" color={textColor} />
        ) : (
          <>
            {leftIcon}
            <Text variant={SIZE_TEXT_VARIANT[size]} color={textColor}>
              {children}
            </Text>
          </>
        )}
      </ButtonBox>
    </Pressable>
  );
}
