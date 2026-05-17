import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import { useThemeMode } from 'src/infra/theme/AppThemeProvider';

const COLS = 20;
const ROWS = 7;
const TOTAL_CELLS = COLS * ROWS;
const SEED = 7;
const STAGGER_MS = 8;
const GAP = 3;

// Paleta clássica do heatmap do GitHub (níveis 0–4).
const GITHUB_LIGHT = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'] as const;
const GITHUB_DARK = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] as const;

function buildIntensities(): number[] {
  let s = SEED;
  const out: number[] = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    if (r < 0.45) out.push(0);
    else if (r < 0.7) out.push(1);
    else if (r < 0.88) out.push(2);
    else if (r < 0.97) out.push(3);
    else out.push(4);
  }
  return out;
}

interface ContribCardProps {
  totalContributions?: number;
}

export function ContribCard({ totalContributions = 1284 }: ContribCardProps) {
  const { resolvedScheme } = useThemeMode();
  const palette = resolvedScheme === 'dark' ? GITHUB_DARK : GITHUB_LIGHT;

  const intensities = useMemo(buildIntensities, []);
  const animations = useRef<Animated.Value[]>(intensities.map(() => new Animated.Value(0))).current;
  const [cellSize, setCellSize] = useState(0);

  useEffect(() => {
    Animated.stagger(
      STAGGER_MS,
      animations.map((v) =>
        Animated.timing(v, { toValue: 1, duration: 220, useNativeDriver: true }),
      ),
    ).start();
  }, [animations]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    const next = Math.floor((width - GAP * (COLS - 1)) / COLS);
    if (next > 0 && next !== cellSize) setCellSize(next);
  };

  return (
    <Box
      marginHorizontal="huge"
      marginBottom="xxxl"
      padding="xxl"
      backgroundColor="surface"
      borderColor="border"
      borderWidth={1}
      borderRadius="xxl"
    >
      <Box
        flexDirection="row"
        alignItems="baseline"
        justifyContent="space-between"
        marginBottom="md"
      >
        <Text variant="h3">Contribuições</Text>
        <Text variant="caption">{totalContributions.toLocaleString('pt-BR')} no último ano</Text>
      </Box>

      <Box onLayout={handleLayout}>
        {cellSize > 0 && (
          <Box gap="xs" style={{ gap: GAP }}>
            {Array.from({ length: ROWS }).map((_, row) => (
              <Box key={row} flexDirection="row" style={{ gap: GAP }}>
                {Array.from({ length: COLS }).map((__, col) => {
                  const idx = row * COLS + col;
                  const level = intensities[idx] ?? 0;
                  return (
                    <Animated.View
                      key={col}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderRadius: 3,
                        backgroundColor: palette[level],
                        opacity: animations[idx],
                      }}
                    />
                  );
                })}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
