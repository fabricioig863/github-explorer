import { useTheme } from '@shopify/restyle';
import { FolderOpen } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { CollectionCard } from '@/presentation/components/CollectionCard';
import { EmptyState } from '@/presentation/components/EmptyState';
import { SavedRepoRow } from '@/presentation/components/SavedRepoRow';
import { SegmentedTabs, type SegmentedTab } from '@/presentation/components/SegmentedTabs';
import { ThemeToggleButton } from '@/presentation/components/ThemeToggleButton';
import { Skeleton } from '@/presentation/design-system/Skeleton';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import { useSavedRepos } from '@/presentation/hooks/useSavedRepos';
import type { ProfileTabScreenProps } from 'src/infra/navigation/types';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';
import {
  COLLECTIONS,
  countByCollection,
  reposInCollection,
  type CollectionId,
} from '@/presentation/utils/savedCollections';
import { useThemeMode } from 'src/infra/theme/AppThemeProvider';
import type { Theme } from 'src/infra/theme/lightTheme';

type TabId = 'collections' | 'all' | 'recent';

type Props = ProfileTabScreenProps;

export function SavedScreen({ navigation }: Props) {
  const theme = useTheme<Theme>();
  const { resolvedScheme, setMode } = useThemeMode();
  const isDark = resolvedScheme === 'dark';
  const toggleTheme = () => setMode(isDark ? 'light' : 'dark');

  const [tab, setTab] = useState<TabId>('collections');
  const [activeCollection, setActiveCollection] = useState<CollectionId | null>(null);

  const { data: savedRepos = [], isLoading, error } = useSavedRepos();
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
    navigation.navigate('ExploreTab', {
      screen: 'RepoDetail',
      params: { owner: repo.ownerLogin, repo: repo.name },
    });
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

interface CollectionsViewProps {
  counts: Record<CollectionId, number>;
  totalCount: number;
  savedRepos: readonly SavedRepo[];
  activeCollection: CollectionId | null;
  onSelectCollection: (id: CollectionId | null) => void;
  renderRow: ListRenderItem<SavedRepo>;
}

function CollectionsView({
  counts,
  totalCount,
  savedRepos,
  activeCollection,
  onSelectCollection,
  renderRow,
}: CollectionsViewProps) {
  const theme = useTheme<Theme>();
  const filtered = activeCollection === null ? savedRepos : reposInCollection(savedRepos, activeCollection);
  const recent = filtered.slice(0, 4);

  return (
    <FlatList
      data={recent}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderRow}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.huge,
        paddingBottom: theme.spacing.giga,
        gap: theme.spacing.md,
      }}
      ListHeaderComponent={
        <Box gap="xl">
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="eyebrow">SUAS COLEÇÕES · {COLLECTIONS.length}</Text>
          </Box>
          <Box flexDirection="row" gap="md" flexWrap="wrap">
            {COLLECTIONS.slice(0, 2).map((collection) => (
              <CollectionCard
                key={collection.id}
                title={collection.title}
                count={counts[collection.id]}
                iconColor={collection.iconColor}
                glyph={collection.glyph}
                onPress={() =>
                  onSelectCollection(activeCollection === collection.id ? null : collection.id)
                }
              />
            ))}
          </Box>
          <Box flexDirection="row" gap="md" flexWrap="wrap">
            {COLLECTIONS.slice(2).map((collection) => (
              <CollectionCard
                key={collection.id}
                title={collection.title}
                count={counts[collection.id]}
                iconColor={collection.iconColor}
                glyph={collection.glyph}
                onPress={() =>
                  onSelectCollection(activeCollection === collection.id ? null : collection.id)
                }
              />
            ))}
          </Box>
          <Box paddingTop="huge">
            <Text variant="eyebrow">
              {activeCollection === null
                ? `SALVOS RECENTEMENTE${totalCount > 0 ? ` · ${totalCount}` : ''}`
                : `EM ${COLLECTIONS.find((c) => c.id === activeCollection)?.title.toUpperCase() ?? ''}`}
            </Text>
          </Box>
        </Box>
      }
      ListEmptyComponent={
        <Box paddingTop="huge">
          <CollectionsEmpty />
        </Box>
      }
    />
  );
}

function CollectionsEmpty() {
  const theme = useTheme<Theme>();
  return (
    <Box alignItems="center" gap="md" paddingVertical="huge">
      <FolderOpen size={28} color={theme.colors.fgSubtle} />
      <Text variant="bodySmall" color="fgMuted" textAlign="center">
        Nenhum repositório salvo ainda nesta coleção.
      </Text>
    </Box>
  );
}

interface RecentListProps {
  data: readonly SavedRepo[];
  renderRow: ListRenderItem<SavedRepo>;
  emptyTitle: string;
  emptyDescription: string;
}

function RecentList({ data, renderRow, emptyTitle, emptyDescription }: RecentListProps) {
  const theme = useTheme<Theme>();
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderRow}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.huge,
        paddingBottom: theme.spacing.giga,
        gap: theme.spacing.md,
      }}
    />
  );
}

function SavedScreenSkeleton() {
  return (
    <Box paddingHorizontal="huge" gap="huge">
      <Box flexDirection="row" gap="md">
        <Box flex={1}>
          <Skeleton height={140} radius={16} />
        </Box>
        <Box flex={1}>
          <Skeleton height={140} radius={16} />
        </Box>
      </Box>
      <Box flexDirection="row" gap="md">
        <Box flex={1}>
          <Skeleton height={140} radius={16} />
        </Box>
        <Box flex={1}>
          <Skeleton height={140} radius={16} />
        </Box>
      </Box>
      <Box gap="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={68} radius={16} />
        ))}
      </Box>
    </Box>
  );
}
