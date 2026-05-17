import { useTheme } from '@shopify/restyle';
import { Moon, Sun } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import type { Theme } from 'src/infra/theme/lightTheme';

interface ThemeToggleButtonProps {
  isDark: boolean;
  onToggle: () => void;
}

const TRACK_W = 32;
const TRACK_H = 18;
const THUMB = 12;
const THUMB_INSET = 3;
const THUMB_END = TRACK_W - THUMB - THUMB_INSET * 2;

const THUMB_COLOR = '#ffffff';

export function ThemeToggleButton({ isDark, onToggle }: ThemeToggleButtonProps) {
  const theme = useTheme<Theme>();
  const thumbX = useRef(new Animated.Value(isDark ? THUMB_END : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(thumbX, {
      toValue: isDark ? THUMB_END : 0,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [isDark, thumbX]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.94, duration: 150, useNativeDriver: true }),
      Animated.spring(rotate, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(rotate, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const rotateDeg = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '20deg'] });
  const Icon = isDark ? Moon : Sun;

  return (
    <Pressable onPress={onToggle} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          borderRadius="pill"
          backgroundColor="surface"
          borderColor="borderStrong"
          borderWidth={1.5}
          paddingHorizontal="xl"
          paddingVertical="sm"
        >
          <Animated.View style={{ transform: [{ rotate: rotateDeg }] }}>
            <Icon size={14} color={theme.colors.fg} />
          </Animated.View>
          <Box
            width={TRACK_W}
            height={TRACK_H}
            borderRadius="pill"
            justifyContent="center"
            padding="none"
            backgroundColor={isDark ? 'accent' : 'borderStrong'}
            style={{ paddingHorizontal: THUMB_INSET }}
          >
            <Animated.View
              style={{
                width: THUMB,
                height: THUMB,
                borderRadius: THUMB / 2,
                backgroundColor: THUMB_COLOR,
                transform: [{ translateX: thumbX }],
              }}
            />
          </Box>
        </Box>
      </Animated.View>
    </Pressable>
  );
}
