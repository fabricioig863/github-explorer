import { useTheme } from '@shopify/restyle';
import { FlatList, type ListRenderItem } from 'react-native';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { CollectionCard } from '@/presentation/components/CollectionCard';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import {
  COLLECTIONS,
  reposInCollection,
  type CollectionId,
} from '@/presentation/utils/savedCollections';
import type { Theme } from 'src/infra/theme/lightTheme';

import { CollectionsEmpty } from './CollectionsEmpty';

interface CollectionsViewProps {
  counts: Record<CollectionId, number>;
  totalCount: number;
  savedRepos: readonly SavedRepo[];
  activeCollection: CollectionId | null;
  onSelectCollection: (id: CollectionId | null) => void;
  renderRow: ListRenderItem<SavedRepo>;
}

export function CollectionsView({
  counts,
  totalCount,
  savedRepos,
  activeCollection,
  onSelectCollection,
  renderRow,
}: CollectionsViewProps) {
  const theme = useTheme<Theme>();
  const filtered =
    activeCollection === null ? savedRepos : reposInCollection(savedRepos, activeCollection);
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
