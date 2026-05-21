import type { Repository } from '@/domain/entities/Repository';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

import { TopicPill } from './TopicPill';

export function RepoHero({ repo }: { repo: Repository }) {
  return (
    <Box
      padding="huge"
      borderRadius="xxl"
      backgroundColor="surfaceMuted"
      borderColor="border"
      borderWidth={1}
      gap="md"
    >
      <Text variant="caption" color="fgMuted">
        @{repo.owner.login} · {repo.owner.type}
      </Text>
      <Text variant="display">{repo.name}</Text>
      {repo.description !== null && (
        <Text variant="body" color="fgMuted">
          {repo.description}
        </Text>
      )}
      {repo.topics.length > 0 && (
        <Box flexDirection="row" flexWrap="wrap" gap="sm" marginTop="sm">
          {repo.topics.slice(0, 5).map((topic) => (
            <TopicPill key={topic} label={topic} />
          ))}
        </Box>
      )}
    </Box>
  );
}
