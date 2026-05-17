import { Pressable } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

interface CollectionCardProps {
  title: string;
  count: number;
  iconColor: string;
  glyph: string;
  onPress?: () => void;
}

/**
 * Card grande para uma coleção fixa. Square colorido + título + count.
 * `iconColor` é hex cru (vem de COLLECTIONS, não do theme) por design — as
 * cores das coleções são identidade própria da feature, independente do
 * modo light/dark.
 */
export function CollectionCard({ title, count, iconColor, glyph, onPress }: CollectionCardProps) {
  const content = (
    <Box
      flex={1}
      gap="huge"
      padding="huge"
      borderRadius="xxl"
      backgroundColor="surface"
      borderColor="border"
      borderWidth={1}
      minHeight={140}
    >
      <Box
        width={40}
        height={40}
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
        style={{ backgroundColor: iconColor }}
      >
        <Text style={{ color: '#ffffff', fontFamily: 'Geist_600SemiBold', fontSize: 18 }}>
          {glyph}
        </Text>
      </Box>
      <Box gap="xs">
        <Text variant="h3">{title}</Text>
        <Text variant="caption">
          {count} {count === 1 ? 'repo' : 'repos'}
        </Text>
      </Box>
    </Box>
  );

  if (onPress === undefined) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Coleção ${title}, ${count} repositórios`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flex: 1 })}
    >
      {content}
    </Pressable>
  );
}
