import { useTheme } from '@shopify/restyle';
import { ActivityIndicator } from 'react-native';

import type { Theme } from 'src/infra/theme/lightTheme';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: keyof Theme['colors'];
}

export function Spinner({ size = 'small', color = 'fgMuted' }: SpinnerProps) {
  const theme = useTheme<Theme>();
  return <ActivityIndicator size={size} color={theme.colors[color]} />;
}
