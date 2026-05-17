import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import type { Theme } from 'src/infra/theme/lightTheme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  value,
  onChangeText,
  placeholder,
  ...rest
}: InputProps) {
  const theme = useTheme<Theme>();
  const hasError = error !== undefined && error.length > 0;

  return (
    <Box>
      {label !== undefined && (
        <Box marginBottom="sm">
          <Text variant="bodySmall" color="fgMuted">
            {label}
          </Text>
        </Box>
      )}

      <Box
        flexDirection="row"
        alignItems="center"
        gap="md"
        paddingHorizontal="xl"
        paddingVertical="lg"
        borderRadius="lg"
        borderWidth={1}
        borderColor={hasError ? 'danger' : 'border'}
        backgroundColor={hasError ? 'dangerBg' : 'surface'}
      >
        {leftIcon}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.fgSubtle}
          style={{
            flex: 1,
            fontFamily: 'Geist_400Regular',
            fontSize: 14,
            color: theme.colors.fg,
            padding: 0,
          }}
          {...rest}
        />
      </Box>

      {(hasError || helperText !== undefined) && (
        <Box marginTop="sm">
          <Text variant="caption" color={hasError ? 'danger' : 'fgSubtle'}>
            {hasError ? error : helperText}
          </Text>
        </Box>
      )}
    </Box>
  );
}
