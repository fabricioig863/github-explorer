import { useTheme } from '@shopify/restyle';
import { GitFork, Star } from 'lucide-react-native';

import type { Repository } from '@/domain/entities/Repository';
import { Avatar } from '@/presentation/design-system/Avatar';
import { Card } from '@/presentation/design-system/Card';
import { Box } from '@/presentation/design-system/primitives/Box';
import { LanguageDot } from '@/presentation/design-system/primitives/LanguageDot';
import { Text } from '@/presentation/design-system/primitives/Text';
import { formatCount } from '@/presentation/utils/formatCount';
import type { Theme } from 'src/infra/theme/lightTheme';

interface RepoListItemProps {
  repo: Repository;
  onPress: () => void;
}

export function RepoListItem({ repo, onPress }: RepoListItemProps) {
  const theme = useTheme<Theme>();

  return (
    <Card variant="surface" onPress={onPress}>
      <Box flexDirection="row" gap="md">
        <Avatar uri={repo.owner.avatarUrl} login={repo.owner.login} size="md" />
        <Box flex={1} gap="xs" style={{ minWidth: 0 }}>
          <Text variant="bodySmall" color="fgMuted" numberOfLines={1}>
            {repo.owner.login}
          </Text>
          <Text variant="h3" numberOfLines={1} ellipsizeMode="tail">
            {repo.name}
          </Text>
          {repo.description !== null && (
            <Text variant="bodySmall" color="fgMuted" numberOfLines={2}>
              {repo.description}
            </Text>
          )}
          <Box flexDirection="row" alignItems="center" gap="lg" marginTop="sm" flexWrap="wrap">
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Star size={12} color={theme.colors.fgSubtle} />
              <Text variant="mono">{formatCount(repo.stars)}</Text>
            </Box>
            <LanguageDot language={repo.language} />
            <Box flexDirection="row" alignItems="center" gap="xs">
              <GitFork size={12} color={theme.colors.fgSubtle} />
              <Text variant="mono">{formatCount(repo.forks)}</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

