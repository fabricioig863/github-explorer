import { useEffect, useRef } from 'react';
import { Animated, Easing, type DimensionValue } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
}

const PULSE_MS = 1100;
const MIN_OPACITY = 0.45;
const MAX_OPACITY = 1;

export function Skeleton({ width = '100%', height = 16, radius = 6 }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(MAX_OPACITY)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: MIN_OPACITY,
          duration: PULSE_MS / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: MAX_OPACITY,
          duration: PULSE_MS / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityLabel="Carregando"
      accessibilityRole="progressbar"
      style={{ width, height, borderRadius: radius, opacity }}
    >
      <Box flex={1} backgroundColor="surfaceMuted" style={{ borderRadius: radius }} />
    </Animated.View>
  );
}
