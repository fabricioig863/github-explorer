import { useTheme } from '@shopify/restyle';
import { FlatList, type ListRenderItem } from 'react-native';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { EmptyState } from '@/presentation/components/EmptyState';
import type { Theme } from 'src/infra/theme/lightTheme';

interface RecentListProps {
  data: readonly SavedRepo[];
  renderRow: ListRenderItem<SavedRepo>;
  emptyTitle: string;
  emptyDescription: string;
}

export function RecentList({ data, renderRow, emptyTitle, emptyDescription }: RecentListProps) {
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
