import { useTheme } from '@shopify/restyle';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, type ListRenderItem } from 'react-native';

import type { Repository } from '@/domain/entities/Repository';
import { EmptyState } from '@/presentation/components/EmptyState';
import { RateLimitBanner } from '@/presentation/components/RateLimitBanner';
import { RepoListItem } from '@/presentation/components/RepoListItem';
import { Skeleton } from '@/presentation/design-system/Skeleton';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Spinner } from '@/presentation/design-system/primitives/Spinner';
import { Text } from '@/presentation/design-system/primitives/Text';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { useSearchRepos } from '@/presentation/hooks/useSearchRepos';
import { getEmptySearchCopy } from '@/presentation/utils/getEmptySearchCopy';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';
import type { ExploreStackScreenProps } from 'src/infra/navigation/types';
import type { Theme } from 'src/infra/theme/lightTheme';

import { SearchHeader } from './components/SearchHeader';

type Props = ExploreStackScreenProps<'Search'>;

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function SearchScreen({ navigation }: Props) {
  const theme = useTheme<Theme>();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    error,
  } = useSearchRepos({ query: debouncedQuery });

  const repos: Repository[] = data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount;
  const queryHasMinLength = debouncedQuery.trim().length >= MIN_QUERY_LENGTH;

  const handleRepoPress = useCallback(
    (repo: Repository) => {
      navigation.navigate('RepoDetail', {
        owner: repo.owner.login,
        repo: repo.name,
      });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<Repository> = useCallback(
    ({ item }) => <RepoListItem repo={item} onPress={() => handleRepoPress(item)} />,
    [handleRepoPress],
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <Box padding="xxl" alignItems="center">
        <Spinner size="small" color="fgSubtle" />
      </Box>
    );
  };

  if (!queryHasMinLength) {
    return (
      <Box flex={1} backgroundColor="bg">
        <SearchHeader query={query} onChangeQuery={setQuery} />
        <EmptyState
          title="Busque um repositório"
          description="Digite ao menos 2 caracteres para começar."
        />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box flex={1} backgroundColor="bg">
        <SearchHeader query={query} onChangeQuery={setQuery} />
        <Box paddingHorizontal="xxxl" paddingTop="md" gap="lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={84} radius={12} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error !== null) {
    return (
      <Box flex={1} backgroundColor="bg">
        <SearchHeader query={query} onChangeQuery={setQuery} />
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

  if (repos.length === 0) {
    const { title, description } = getEmptySearchCopy(debouncedQuery);
    return (
      <Box flex={1} backgroundColor="bg">
        <SearchHeader query={query} onChangeQuery={setQuery} />
        <EmptyState title={title} description={description} />
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="bg">
      <SearchHeader query={query} onChangeQuery={setQuery} />
      {totalCount !== undefined && (
        <Box paddingHorizontal="xxxl" paddingVertical="md">
          <Text variant="caption">
            {totalCount.toLocaleString('pt-BR')} resultado{totalCount === 1 ? '' : 's'}
          </Text>
        </Box>
      )}
      <FlatList
        data={repos}
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
