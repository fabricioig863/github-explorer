import { useTheme } from '@shopify/restyle';
import { GitFork, Star } from 'lucide-react-native';

import type { Repository } from '@/domain/entities/Repository';
import type { Theme } from '@/infrastructure/theme/lightTheme';
import { Avatar } from '@/presentation/design-system/Avatar';
import { Card } from '@/presentation/design-system/Card';
import { Box } from '@/presentation/design-system/primitives/Box';
import { LanguageDot } from '@/presentation/design-system/primitives/LanguageDot';
import { Text } from '@/presentation/design-system/primitives/Text';

interface RepoListItemProps {
  repo: Repository;
  onPress: () => void;
}

/**
 * Card de repositório para listas — busca, favoritos (futuro), etc.
 * Exibe avatar do owner, nome, descrição, e metadados (stars, lang, forks).
 */
export function RepoListItem({ repo, onPress }: RepoListItemProps) {
  const theme = useTheme<Theme>();

  return (
    <Card variant="surface" onPress={onPress}>
      <Box flexDirection="row" gap="md">
        <Avatar uri={repo.owner.avatarUrl} login={repo.owner.login} size="md" />
        <Box flex={1} gap="xs">
          <Text variant="bodySmall" color="fgMuted">
            {repo.owner.login}
          </Text>
          <Text variant="h3">{repo.name}</Text>
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

function formatCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  return `${Math.floor(count / 1000)}k`;
}
