import { useTheme } from '@shopify/restyle';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { EmptyState } from '@/presentation/components/EmptyState';
import { SavedRepoRow } from '@/presentation/components/SavedRepoRow';
import { SegmentedTabs, type SegmentedTab } from '@/presentation/components/SegmentedTabs';
import { ThemeToggleButton } from '@/presentation/components/ThemeToggleButton';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import { savedQueries } from '@/presentation/query/collections/savedQueries';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';
import { countByCollection, type CollectionId } from '@/presentation/utils/savedCollections';
import type { SavedStackScreenProps } from 'src/infra/navigation/types';
import { useThemeMode } from 'src/infra/theme/AppThemeProvider';
import type { Theme } from 'src/infra/theme/lightTheme';

import { CollectionsView } from './components/CollectionsView';
import { RecentList } from './components/RecentList';
import { SavedScreenSkeleton } from './components/SavedScreenSkeleton';

type TabId = 'collections' | 'all' | 'recent';

type Props = SavedStackScreenProps<'Saved'>;

export function SavedScreen({ navigation }: Props) {
  const theme = useTheme<Theme>();
  const { resolvedScheme, setMode } = useThemeMode();
  const isDark = resolvedScheme === 'dark';
  const toggleTheme = () => setMode(isDark ? 'light' : 'dark');

  const [tab, setTab] = useState<TabId>('collections');
  const [activeCollection, setActiveCollection] = useState<CollectionId | null>(null);

  const { data: savedRepos = [], isLoading, error } = useQuery(savedQueries.list());
  const counts = useMemo(() => countByCollection(savedRepos), [savedRepos]);
  const totalCount = savedRepos.length;

  const tabs: readonly SegmentedTab<TabId>[] = useMemo(
    () => [
      { id: 'collections', label: 'Coleções' },
      { id: 'all', label: `Todos · ${totalCount}` },
      { id: 'recent', label: 'Recentes' },
    ],
    [totalCount],
  );

  const handleOpenRepo = (repo: SavedRepo) => {
    navigation.navigate('RepoDetail', { owner: repo.ownerLogin, repo: repo.name });
  };

  const renderRow: ListRenderItem<SavedRepo> = ({ item }) => (
    <SavedRepoRow repo={item} onPress={() => handleOpenRepo(item)} />
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Box
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="huge"
        paddingTop="md"
        paddingBottom="huge"
        gap="md"
      >
        <Text variant="h1" style={{ flex: 1, letterSpacing: -0.4 }}>
          Salvos
        </Text>
        <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />
      </Box>

      <Box paddingHorizontal="huge" paddingBottom="huge">
        <SegmentedTabs
          tabs={tabs}
          selected={tab}
          onChange={(id) => {
            setTab(id);
            setActiveCollection(null);
          }}
        />
      </Box>

      {isLoading ? (
        <SavedScreenSkeleton />
      ) : error !== null ? (
        <EmptyState title="Não foi possível carregar" description={getErrorMessage(error)} />
      ) : tab === 'collections' ? (
        <CollectionsView
          counts={counts}
          totalCount={totalCount}
          savedRepos={savedRepos}
          activeCollection={activeCollection}
          onSelectCollection={setActiveCollection}
          renderRow={renderRow}
        />
      ) : tab === 'all' ? (
        <RecentList
          data={[...savedRepos].sort((a, b) => a.fullName.localeCompare(b.fullName))}
          renderRow={renderRow}
          emptyTitle="Você ainda não salvou nenhum repositório"
          emptyDescription="Toque no ícone de marcador na tela de detalhes para começar."
        />
      ) : (
        <RecentList
          data={savedRepos}
          renderRow={renderRow}
          emptyTitle="Sem atividade recente"
          emptyDescription="Quando você salvar repositórios, eles aparecerão aqui."
        />
      )}
    </SafeAreaView>
  );
}
