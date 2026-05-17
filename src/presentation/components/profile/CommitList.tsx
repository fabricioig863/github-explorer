import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import type { RecentCommit } from '@/domain/entities/RecentCommit';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

interface CommitListProps {
  commits: RecentCommit[];
}

const BASE_DELAY = 50;
const STEP_DELAY = 70;
const DURATION = 400;
const DOT_SIZE = 8;

function formatRelative(date: Date): string {
  return `há ${formatDistanceToNowStrict(date, { locale: ptBR })}`;
}

interface CommitItemProps {
  commit: RecentCommit;
  index: number;
  isLast: boolean;
}

function CommitItem({ commit, index, isLast }: CommitItemProps) {
  const translateY = useRef(new Animated.Value(8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = BASE_DELAY + index * STEP_DELAY;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: DURATION,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: DURATION,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateY, opacity]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Box
        flexDirection="row"
        gap="lg"
        paddingVertical="xl"
        paddingHorizontal="xs"
        borderBottomColor="border"
        borderBottomWidth={isLast ? 0 : 1}
      >
        <Box
          width={DOT_SIZE}
          height={DOT_SIZE}
          backgroundColor="accent"
          marginTop="sm"
          style={{ borderRadius: DOT_SIZE / 2 }}
        />
        <Box flex={1} minWidth={0}>
          <Text variant="bodySmall" color="fg" numberOfLines={1} ellipsizeMode="tail">
            {commit.message}
          </Text>
          <Box flexDirection="row" alignItems="center" gap="md" marginTop="xs">
            <Box
              paddingHorizontal="sm"
              borderRadius="sm"
              borderWidth={1}
              borderColor="border"
              backgroundColor="surfaceMuted"
            >
              <Text variant="caption" color="fgMuted">
                {commit.sha}
              </Text>
            </Box>
            <Text variant="caption" color="accent">
              {commit.repo}
            </Text>
            <Text variant="caption">{formatRelative(commit.createdAt)}</Text>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
}

export function CommitList({ commits }: CommitListProps) {
  return (
    <Box paddingHorizontal="huge">
      {commits.map((commit, index) => (
        <CommitItem
          key={commit.sha + index}
          commit={commit}
          index={index}
          isLast={index === commits.length - 1}
        />
      ))}
    </Box>
  );
}
