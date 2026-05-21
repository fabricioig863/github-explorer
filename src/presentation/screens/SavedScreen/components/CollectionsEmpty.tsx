import { useTheme } from '@shopify/restyle';
import { FolderOpen } from 'lucide-react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import type { Theme } from 'src/infra/theme/lightTheme';

export function CollectionsEmpty() {
  const theme = useTheme<Theme>();
  return (
    <Box alignItems="center" gap="md" paddingVertical="huge">
      <FolderOpen size={28} color={theme.colors.fgSubtle} />
      <Text variant="bodySmall" color="fgMuted" textAlign="center">
        Nenhum repositório salvo ainda nesta coleção.
      </Text>
    </Box>
  );
}
