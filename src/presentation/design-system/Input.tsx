import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import type { Theme } from 'src/infra/theme/lightTheme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Label acima do input. Opcional. */
  label?: string;
  /** Mensagem de erro abaixo. Quando presente, input recebe estilo de erro. */
  error?: string;
  /** Texto auxiliar abaixo (sumido se error presente). */
  helperText?: string;
  /** Ícone à esquerda dentro do input, ex: <Search size={16} /> */
  leftIcon?: ReactNode;
}

/**
 * Campo de texto com label, error e helperText.
 * Erro tem precedência sobre helperText (não exibe ambos).
 *
 * NOTA: `style` no TextInput é exceção justificada — TextInput nativo não aceita props Restyle.
 *
 * @example
 * <Input
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 *   helperText="Vamos enviar confirmação"
 * />
 */
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
