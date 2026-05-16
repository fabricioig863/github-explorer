import { useTheme } from '@shopify/restyle';
import { ActivityIndicator } from 'react-native';

import type { Theme } from '@/infrastructure/theme/lightTheme';

interface SpinnerProps {
  /** 'small' usa o tamanho nativo pequeno; 'large' o grande. Default: 'small'. */
  size?: 'small' | 'large';
  /** Cor via token do theme. Default: 'fgMuted'. */
  color?: keyof Theme['colors'];
}

/**
 * Loader nativo (ActivityIndicator). iOS e Android renderizam idiomático.
 * Use color por token para consistência com tema.
 *
 * @example
 * <Spinner />
 * <Spinner size="large" color="accent" />
 */
export function Spinner({ size = 'small', color = 'fgMuted' }: SpinnerProps) {
  const theme = useTheme<Theme>();
  return <ActivityIndicator size={size} color={theme.colors[color]} />;
}
