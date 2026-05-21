import { useTheme } from '@shopify/restyle';
import { CircleDot } from 'lucide-react-native';

import type { Theme } from 'src/infra/theme/lightTheme';

export function CircleDotIcon() {
  const theme = useTheme<Theme>();
  return <CircleDot size={16} color={theme.colors.fg} />;
}
