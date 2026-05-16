import { useTheme } from '@shopify/restyle';
import { CircleDot, Eye, GitFork, Star } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import type { Repository } from '@/domain/entities/Repository';
import type { Theme } from '@/infrastructure/theme/lightTheme';
import { EmptyState } from '@/presentation/components/EmptyState';
import { Avatar } from '@/presentation/design-system/Avatar';
import { Button } from '@/presentation/design-system/Button';
import { Card } from '@/presentation/design-system/Card';
import { Box } from '@/presentation/design-system/primitives/Box';
import { LanguageDot } from '@/presentation/design-system/primitives/LanguageDot';
import { Spinner } from '@/presentation/design-system/primitives/Spinner';
import { Text } from '@/presentation/design-system/primitives/Text';
import { useRepoDetails } from '@/presentation/hooks/useRepoDetails';
import type { ExploreStackScreenProps } from '@/presentation/navigation/types';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';

type Props = ExploreStackScreenProps<'RepoDetail'>;

export function RepoDetailScreen({ route, navigation }: Props) {
  const { owner, repo } = route.params;
  const { data, isLoading, error } = useRepoDetails({ owner, repo });

  if (isLoading) {
    return (
      <Box flex={1} backgroundColor="bg" alignItems="center" justifyContent="center">
        <Spinner size="large" color="accent" />
      </Box>
    );
  }

  if (error !== null) {
    return (
      <Box flex={1} backgroundColor="bg">
        <EmptyState title="Algo deu errado" description={getErrorMessage(error)} />
      </Box>
    );
  }

  if (data === undefined) {
    return (
      <Box flex={1} backgroundColor="bg">
        <EmptyState title="Repositório não encontrado" />
      </Box>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <Box flex={1} backgroundColor="bg" padding="xxxl" gap="xxxl">
        <RepoHero repo={data} />
        <StatsGrid repo={data} />
        <RepoMeta repo={data} />
        <Button
          variant="primary"
          size="md"
          onPress={() => navigation.navigate('Issues', { owner, repo })}
        >
          Ver {data.openIssuesCount} issues abertas
        </Button>
      </Box>
    </ScrollView>
  );
}

interface RepoSectionProps {
  repo: Repository;
}

function RepoHero({ repo }: RepoSectionProps) {
  return (
    <Box gap="md">
      <Box flexDirection="row" alignItems="center" gap="md">
        <Avatar uri={repo.owner.avatarUrl} login={repo.owner.login} size="lg" />
        <Box flex={1} gap="xs">
          <Text variant="bodySmall" color="fgMuted">
            {repo.owner.login} · {repo.owner.type}
          </Text>
          <Text variant="h1">{repo.name}</Text>
        </Box>
      </Box>
      {repo.description !== null && (
        <Text variant="body" color="fgMuted">
          {repo.description}
        </Text>
      )}
    </Box>
  );
}

function StatsGrid({ repo }: RepoSectionProps) {
  const theme = useTheme<Theme>();
  return (
    <Box flexDirection="row" gap="md">
      <StatCard
        icon={<Star size={16} color={theme.colors.fgMuted} />}
        label="Estrelas"
        value={formatCount(repo.stars)}
      />
      <StatCard
        icon={<GitFork size={16} color={theme.colors.fgMuted} />}
        label="Forks"
        value={formatCount(repo.forks)}
      />
      <StatCard
        icon={<Eye size={16} color={theme.colors.fgMuted} />}
        label="Watchers"
        value={formatCount(repo.watchers)}
      />
    </Box>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Box flex={1}>
      <Card variant="flat">
        <Box gap="xs" alignItems="center">
          {icon}
          <Text variant="h3">{value}</Text>
          <Text variant="caption">{label}</Text>
        </Box>
      </Card>
    </Box>
  );
}

function RepoMeta({ repo }: RepoSectionProps) {
  const theme = useTheme<Theme>();
  return (
    <Card variant="surface">
      <Box gap="md">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="bodySmall" color="fgMuted">
            Linguagem
          </Text>
          <LanguageDot language={repo.language} />
        </Box>
        <Box height={1} backgroundColor="border" />
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="bodySmall" color="fgMuted">
            Issues abertas
          </Text>
          <Box flexDirection="row" alignItems="center" gap="xs">
            <CircleDot size={14} color={theme.colors.success} />
            <Text variant="mono">{repo.openIssuesCount}</Text>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

/**
 * Formata contagem grande: 120000 → 120k, 1500 → 1.5k.
 * Mesma função que RepoListItem usa — quando aparecer terceira ocorrência,
 * extrair pra presentation/utils/formatCount.ts.
 */
function formatCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  return `${Math.floor(count / 1000)}k`;
}
