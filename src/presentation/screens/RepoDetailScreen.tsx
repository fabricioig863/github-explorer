import { useTheme } from '@shopify/restyle';
import { CircleDot, FileCode, GitBranch, Scale } from 'lucide-react-native';
import { useLayoutEffect, type ReactNode } from 'react';
import { ScrollView } from 'react-native';

import type { Repository } from '@/domain/entities/Repository';
import { BookmarkButton } from '@/presentation/components/BookmarkButton';
import { EmptyState } from '@/presentation/components/EmptyState';
import { RateLimitBanner } from '@/presentation/components/RateLimitBanner';
import { Button } from '@/presentation/design-system/Button';
import { Skeleton } from '@/presentation/design-system/Skeleton';
import { Box } from '@/presentation/design-system/primitives/Box';
import { LanguageDot } from '@/presentation/design-system/primitives/LanguageDot';
import { Text } from '@/presentation/design-system/primitives/Text';
import { useIsRepoSaved } from '@/presentation/hooks/useIsRepoSaved';
import { useOpenIssuesCount } from '@/presentation/hooks/useOpenIssuesCount';
import { useRepoDetails } from '@/presentation/hooks/useRepoDetails';
import { useToggleSaveRepo } from '@/presentation/hooks/useToggleSaveRepo';
import type { ExploreStackScreenProps } from 'src/infra/navigation/types';
import { formatCount } from '@/presentation/utils/formatCount';
import { formatRelativeDate } from '@/presentation/utils/formatRelativeDate';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';
import type { Theme } from 'src/infra/theme/lightTheme';

type Props = ExploreStackScreenProps<'RepoDetail'>;

export function RepoDetailScreen({ route, navigation }: Props) {
  const { owner, repo } = route.params;
  const fullName = `${owner}/${repo}`;

  const { data, isLoading, error, refetch } = useRepoDetails({ owner, repo });
  const { data: openIssuesCount } = useOpenIssuesCount({ owner, repo });
  const { data: isSaved = false } = useIsRepoSaved(fullName);
  const toggleSave = useToggleSaveRepo();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Repositório',
      headerRight: () =>
        data === undefined ? null : (
          <BookmarkButton
            isSaved={isSaved}
            disabled={toggleSave.isPending}
            onPress={() => toggleSave.mutate({ repo: data, isCurrentlySaved: isSaved })}
          />
        ),
    });
  }, [navigation, data, isSaved, toggleSave]);

  if (isLoading) {
    return <RepoDetailSkeleton />;
  }

  if (error !== null) {
    return (
      <Box flex={1} backgroundColor="bg">
        <RateLimitBanner error={error} />
        <EmptyState
          title="Algo deu errado"
          description={getErrorMessage(error)}
          onRetry={() => {
            void refetch();
          }}
        />
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
      <Box flex={1} backgroundColor="bg" padding="huge" gap="huge">
        <RepoHero repo={data} />
        <StatsGrid repo={data} />
        <RepoMeta repo={data} />
        <Button
          variant="outline"
          size="md"
          onPress={() => navigation.navigate('Issues', { owner, repo })}
          leftIcon={<CircleDotIcon />}
        >
          {openIssuesCount === undefined
            ? 'Ver issues abertas'
            : `Ver ${openIssuesCount} issue${openIssuesCount === 1 ? '' : 's'} aberta${openIssuesCount === 1 ? '' : 's'}`}
        </Button>
      </Box>
    </ScrollView>
  );
}

function CircleDotIcon() {
  const theme = useTheme<Theme>();
  return <CircleDot size={16} color={theme.colors.fg} />;
}

function RepoHero({ repo }: { repo: Repository }) {
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

function TopicPill({ label }: { label: string }) {
  return (
    <Box
      paddingHorizontal="md"
      paddingVertical="xs"
      borderRadius="sm"
      backgroundColor="surface"
      borderColor="border"
      borderWidth={1}
    >
      <Text variant="mono" color="fgMuted">
        {label}
      </Text>
    </Box>
  );
}

function StatsGrid({ repo }: { repo: Repository }) {
  return (
    <Box flexDirection="row" gap="md">
      <StatCard label="ESTRELAS" value={formatCount(repo.stars)} />
      <StatCard label="FORKS" value={formatCount(repo.forks)} />
      <StatCard label="WATCH" value={formatCount(repo.watchers)} />
    </Box>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Box
      flex={1}
      padding="huge"
      borderRadius="xxl"
      backgroundColor="surface"
      borderColor="border"
      borderWidth={1}
      gap="md"
    >
      <Text variant="eyebrow">{label}</Text>
      <Text variant="h1">{value}</Text>
    </Box>
  );
}

interface MetaRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  isLast?: boolean;
}

function MetaRow({ icon, label, value, isLast = false }: MetaRowProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="xl"
      paddingHorizontal="huge"
      borderBottomColor="border"
      borderBottomWidth={isLast ? 0 : 1}
    >
      <Box flexDirection="row" alignItems="center" gap="md">
        {icon}
        <Text variant="bodySmall" color="fg" style={{ fontFamily: 'Geist_500Medium' }}>
          {label}
        </Text>
      </Box>
      {typeof value === 'string' ? (
        <Text variant="bodySmall" color="fgMuted">
          {value}
        </Text>
      ) : (
        value
      )}
    </Box>
  );
}

function RepoMeta({ repo }: { repo: Repository }) {
  const theme = useTheme<Theme>();
  return (
    <Box
      borderRadius="xxl"
      backgroundColor="surface"
      borderColor="border"
      borderWidth={1}
      overflow="hidden"
    >
      <MetaRow
        icon={<FileCode size={16} color={theme.colors.fgMuted} />}
        label="Linguagem"
        value={<LanguageDot language={repo.language} />}
      />
      <MetaRow
        icon={<Scale size={16} color={theme.colors.fgMuted} />}
        label="Licença"
        value={repo.license ?? '—'}
      />
      <MetaRow
        icon={<GitBranch size={16} color={theme.colors.fgMuted} />}
        label="Último commit"
        value={formatRelativeDate(repo.pushedAt)}
        isLast
      />
    </Box>
  );
}

function RepoDetailSkeleton() {
  return (
    <Box flex={1} backgroundColor="bg" padding="huge" gap="huge">
      <Skeleton height={180} radius={16} />
      <Box flexDirection="row" gap="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} flex={1}>
            <Skeleton height={88} radius={16} />
          </Box>
        ))}
      </Box>
      <Skeleton height={170} radius={16} />
      <Skeleton height={44} radius={8} />
    </Box>
  );
}
