import { useTheme } from '@shopify/restyle';
import { User } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import type { Theme } from 'src/infra/theme/lightTheme';

interface AvatarRingProps {
  avatarUrl: string | null;
}

const RING = 72;
const PHOTO = 68;
const PULSE_PERIOD_MS = 3000;

export function AvatarRing({ avatarUrl }: AvatarRingProps) {
  const theme = useTheme<Theme>();
  const [errored, setErrored] = useState(false);
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0,
          duration: PULSE_PERIOD_MS / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: PULSE_PERIOD_MS / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const showFallback = avatarUrl === null || avatarUrl.length === 0 || errored;

  return (
    <Box width={RING} height={RING} alignItems="center" justifyContent="center">
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: theme.colors.accent,
            borderRadius: 24,
            opacity: pulse,
          },
        ]}
      />
      <Box
        width={RING}
        height={RING}
        borderRadius="xxl"
        backgroundColor="accent"
        padding="xs"
        alignItems="center"
        justifyContent="center"
        style={{ borderRadius: 22 }}
      >
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          {showFallback ? (
            <Box
              width={PHOTO}
              height={PHOTO}
              backgroundColor="accentSoft"
              alignItems="center"
              justifyContent="center"
              style={{ borderRadius: 20 }}
            >
              <User size={32} color={theme.colors.accent} />
            </Box>
          ) : (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: PHOTO, height: PHOTO, borderRadius: 20 }}
              onError={() => setErrored(true)}
            />
          )}
        </Animated.View>
      </Box>
    </Box>
  );
}
