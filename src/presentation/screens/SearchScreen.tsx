import { useTheme } from '@shopify/restyle';
import { Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, type ListRenderItem } from 'react-native';

import type { Repository } from '@/domain/entities/Repository';
import type { Theme } from '@/infrastructure/theme/lightTheme';
import { EmptyState } from '@/presentation/components/EmptyState';
import { RepoListItem } from '@/presentation/components/RepoListItem';
import { Input } from '@/presentation/design-system/Input';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Spinner } from '@/presentation/design-system/primitives/Spinner';
import { Text } from '@/presentation/design-system/primitives/Text';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { useSearchRepos } from '@/presentation/hooks/useSearchRepos';
import type { ExploreStackScreenProps } from '@/presentation/navigation/types';
import { getEmptySearchCopy } from '@/presentation/utils/getEmptySearchCopy';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';

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
  const totalCount = data?.pages[0]?.totalCount ?? 0;
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
        <Box flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="accent" />
        </Box>
      </Box>
    );
  }

  if (error !== null) {
    return (
      <Box flex={1} backgroundColor="bg">
        <SearchHeader query={query} onChangeQuery={setQuery} />
        <EmptyState title="Algo deu errado" description={getErrorMessage(error)} />
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
      <Box paddingHorizontal="xxxl" paddingVertical="md">
        <Text variant="caption">
          {totalCount.toLocaleString('pt-BR')} resultado{totalCount === 1 ? '' : 's'}
        </Text>
      </Box>
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

interface SearchHeaderProps {
  query: string;
  onChangeQuery: (q: string) => void;
}

function SearchHeader({ query, onChangeQuery }: SearchHeaderProps) {
  const theme = useTheme<Theme>();
  return (
    <Box paddingHorizontal="xxxl" paddingTop="md" paddingBottom="md">
      <Input
        placeholder="react native, typescript..."
        value={query}
        onChangeText={onChangeQuery}
        leftIcon={<Search size={16} color={theme.colors.fgSubtle} />}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </Box>
  );
}
