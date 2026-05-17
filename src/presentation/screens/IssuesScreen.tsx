import { useTheme } from '@shopify/restyle';
import { useCallback } from 'react';
import { FlatList, RefreshControl, type ListRenderItem } from 'react-native';

import type { Issue } from '@/domain/entities/Issue';
import type { Theme } from '@/infrastructure/theme/lightTheme';
import { EmptyState } from '@/presentation/components/EmptyState';
import { IssueListItem } from '@/presentation/components/IssueListItem';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Spinner } from '@/presentation/design-system/primitives/Spinner';
import { Text } from '@/presentation/design-system/primitives/Text';
import { useIssues } from '@/presentation/hooks/useIssues';
import { useOpenIssuesCount } from '@/presentation/hooks/useOpenIssuesCount';
import type { ExploreStackScreenProps } from '@/presentation/navigation/types';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';

type Props = ExploreStackScreenProps<'Issues'>;

export function IssuesScreen({ route }: Props) {
  const { owner, repo } = route.params;
  const theme = useTheme<Theme>();

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    error,
  } = useIssues({ owner, repo, state: 'open' });
  const { data: totalCount } = useOpenIssuesCount({ owner, repo });

  const issues: Issue[] = data?.pages.flatMap((p) => p.items) ?? [];
  const loadedCount = issues.length;
  const headerCount = totalCount ?? loadedCount;
  const headerHasMore = totalCount === undefined && hasNextPage;

  const renderItem: ListRenderItem<Issue> = useCallback(
    ({ item }) => <IssueListItem issue={item} />,
    [],
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <Box padding="xxl" alignItems="center">
        <Spinner size="small" color="fgSubtle" />
      </Box>
    );
  };

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

  if (issues.length === 0) {
    return (
      <Box flex={1} backgroundColor="bg">
        <EmptyState
          title="Nenhuma issue aberta"
          description={`${owner}/${repo} não possui issues abertas no momento.`}
        />
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="bg">
      <Box paddingHorizontal="xxxl" paddingTop="md" paddingBottom="md">
        <Text variant="caption">
          {headerCount.toLocaleString('pt-BR')}
          {headerHasMore ? '+' : ''} issue{headerCount === 1 ? '' : 's'} aberta
          {headerCount === 1 ? '' : 's'}
        </Text>
      </Box>
      <FlatList
        data={issues}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xxxl,
          paddingBottom: theme.spacing.giga,
          gap: theme.spacing.lg,
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={theme.colors.fgSubtle}
          />
        }
        ListFooterComponent={renderFooter}
      />
    </Box>
  );
}
