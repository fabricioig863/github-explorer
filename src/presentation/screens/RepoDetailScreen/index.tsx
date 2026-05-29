import { useQuery } from '@tanstack/react-query';
import { useLayoutEffect } from 'react';
import { ScrollView } from 'react-native';

import { BookmarkButton } from '@/presentation/components/BookmarkButton';
import { EmptyState } from '@/presentation/components/EmptyState';
import { RateLimitBanner } from '@/presentation/components/RateLimitBanner';
import { Button } from '@/presentation/design-system/Button';
import { Box } from '@/presentation/design-system/primitives/Box';
import { useToggleSaveRepo } from '@/presentation/hooks/useToggleSaveRepo';
import { issueQueries } from '@/presentation/query/collections/issueQueries';
import { repoQueries } from '@/presentation/query/collections/repoQueries';
import { savedQueries } from '@/presentation/query/collections/savedQueries';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';
import type { RepoStackScreenProps } from 'src/infra/navigation/types';

import { CircleDotIcon } from './components/CircleDotIcon';
import { RepoDetailSkeleton } from './components/RepoDetailSkeleton';
import { RepoHero } from './components/RepoHero';
import { RepoMeta } from './components/RepoMeta';
import { StatsGrid } from './components/StatsGrid';

type Props = RepoStackScreenProps<'RepoDetail'>;

export function RepoDetailScreen({ route, navigation }: Props) {
  const { owner, repo } = route.params;
  const fullName = `${owner}/${repo}`;

  const { data, isLoading, error, refetch } = useQuery(repoQueries.details(owner, repo));
  const { data: openIssuesCount } = useQuery(issueQueries.openCount(owner, repo));
  const { data: isSaved = false } = useQuery(savedQueries.isSaved(fullName));
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
