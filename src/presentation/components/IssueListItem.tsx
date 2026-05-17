import { useTheme } from '@shopify/restyle';
import { CircleDot } from 'lucide-react-native';

import type { Issue } from '@/domain/entities/Issue';
import { Badge } from '@/presentation/design-system/Badge';
import { Card } from '@/presentation/design-system/Card';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import { formatRelativeDate } from '@/presentation/utils/formatRelativeDate';
import type { Theme } from 'src/infra/theme/lightTheme';

interface IssueListItemProps {
  issue: Issue;
}

export function IssueListItem({ issue }: IssueListItemProps) {
  const theme = useTheme<Theme>();

  return (
    <Card variant="surface">
      <Box flexDirection="row" gap="md">
        <Box paddingTop="xs">
          <CircleDot size={16} color={theme.colors.success} />
        </Box>
        <Box flex={1} gap="sm">
          <Text variant="body">{issue.title}</Text>

          {issue.labels.length > 0 && (
            <Box flexDirection="row" flexWrap="wrap" gap="sm">
              {issue.labels.map((label) => (
                <Badge key={label.id} dotColor={`#${label.color}`}>
                  {label.name}
                </Badge>
              ))}
            </Box>
          )}

          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text variant="caption">#{issue.number}</Text>
            <Text variant="caption">·</Text>
            <Text variant="caption">{formatRelativeDate(issue.createdAt)}</Text>
            <Text variant="caption">·</Text>
            <Text variant="caption">@{issue.author.login}</Text>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
