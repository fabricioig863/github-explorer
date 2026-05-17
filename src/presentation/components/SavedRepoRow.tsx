import { useTheme } from '@shopify/restyle';
import { Bookmark } from 'lucide-react-native';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { Avatar } from '@/presentation/design-system/Avatar';
import { Card } from '@/presentation/design-system/Card';
import { Box } from '@/presentation/design-system/primitives/Box';
import { LanguageDot } from '@/presentation/design-system/primitives/LanguageDot';
import { Text } from '@/presentation/design-system/primitives/Text';
import { formatRelativeDate } from '@/presentation/utils/formatRelativeDate';
import type { Theme } from 'src/infra/theme/lightTheme';

interface SavedRepoRowProps {
  repo: SavedRepo;
  onPress?: () => void;
}

export function SavedRepoRow({ repo, onPress }: SavedRepoRowProps) {
  const theme = useTheme<Theme>();
  return (
    <Card variant="surface" onPress={onPress}>
      <Box flexDirection="row" alignItems="center" gap="md">
        <Avatar uri={repo.ownerAvatarUrl} login={repo.ownerLogin} size="md" />
        <Box flex={1} gap="xs">
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Text variant="bodySmall" color="fgMuted">
              {repo.ownerLogin}
            </Text>
            <Text variant="bodySmall" color="fgSubtle">
              /
            </Text>
            <Text variant="body" style={{ fontFamily: 'Geist_500Medium' }}>
              {repo.name}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="lg">
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Bookmark size={12} color={theme.colors.fgSubtle} />
              <Text variant="caption">salvo {formatRelativeDate(repo.savedAt)}</Text>
            </Box>
            <LanguageDot language={repo.language} />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
