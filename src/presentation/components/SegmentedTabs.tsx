import { Pressable } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

export interface SegmentedTab<T extends string> {
  id: T;
  label: string;
}

interface SegmentedTabsProps<T extends string> {
  tabs: readonly SegmentedTab<T>[];
  selected: T;
  onChange: (id: T) => void;
}

export function SegmentedTabs<T extends string>({
  tabs,
  selected,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <Box flexDirection="row" gap="sm" flexWrap="wrap">
      {tabs.map((tab) => {
        const isActive = tab.id === selected;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            <Box
              paddingHorizontal="xxl"
              paddingVertical="md"
              borderRadius="pill"
              borderWidth={1}
              backgroundColor={isActive ? 'fg' : 'transparent'}
              borderColor={isActive ? 'fg' : 'border'}
            >
              <Text
                variant="bodySmall"
                color={isActive ? 'bg' : 'fgMuted'}
                style={{
                  fontFamily: isActive ? 'Geist_500Medium' : 'Geist_400Regular',
                }}
              >
                {tab.label}
              </Text>
            </Box>
          </Pressable>
        );
      })}
    </Box>
  );
}
