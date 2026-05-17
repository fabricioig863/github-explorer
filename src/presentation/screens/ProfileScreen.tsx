import { useTheme } from '@shopify/restyle';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommitList } from '@/presentation/components/profile/CommitList';
import { ContribCard } from '@/presentation/components/profile/ContribCard';
import { ProfileHero } from '@/presentation/components/profile/ProfileHero';
import { ThemeToggleButton } from '@/presentation/components/profile/ThemeToggleButton';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Spinner } from '@/presentation/design-system/primitives/Spinner';
import { Text } from '@/presentation/design-system/primitives/Text';
import { useProfileData } from '@/presentation/hooks/useProfileData';
import { useRecentCommits } from '@/presentation/hooks/useRecentCommits';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';
import { useThemeMode } from 'src/infra/theme/AppThemeProvider';
import type { Theme } from 'src/infra/theme/lightTheme';

// App não tem autenticação. Endpoint /users/{username} é público — sem login.
// Username vem de env (EXPO_PUBLIC_PROFILE_USERNAME); fallback octocat.
// EXPO_PUBLIC_USE_MOCK=false consome API real via GitHubUserRepository.
const DEFAULT_USERNAME = process.env.EXPO_PUBLIC_PROFILE_USERNAME ?? 'octocat';

export function ProfileScreen() {
  const theme = useTheme<Theme>();
  const { resolvedScheme, setMode } = useThemeMode();
  const isDark = resolvedScheme === 'dark';

  const username = DEFAULT_USERNAME;
  const profileQuery = useProfileData(username);
  const commitsQuery = useRecentCommits({ username });

  const toggleTheme = () => setMode(isDark ? 'light' : 'dark');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Box
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="huge"
        paddingTop="md"
        paddingBottom="xxxl"
        gap="md"
      >
        <Text variant="h1" style={{ flex: 1, letterSpacing: -0.4 }}>
          Meu perfil
        </Text>
        <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {profileQuery.isLoading ? (
          <ProfileSkeleton />
        ) : profileQuery.error !== null ? (
          <ErrorCard message={getErrorMessage(profileQuery.error)} onRetry={profileQuery.refetch} />
        ) : profileQuery.data ? (
          <ProfileHero profile={profileQuery.data} />
        ) : null}

        <ContribCard />

        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="huge"
          paddingTop="xs"
          paddingBottom="lg"
        >
          <Text variant="eyebrow">Commits recentes</Text>
          <Pressable hitSlop={8}>
            <Text variant="bodySmall" color="accent">
              Ver todos
            </Text>
          </Pressable>
        </Box>

        {commitsQuery.isLoading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <Spinner color="fgSubtle" />
          </View>
        ) : commitsQuery.error !== null ? (
          <ErrorCard message={getErrorMessage(commitsQuery.error)} onRetry={commitsQuery.refetch} />
        ) : commitsQuery.data && commitsQuery.data.length > 0 ? (
          <CommitList commits={commitsQuery.data} />
        ) : (
          <Box paddingHorizontal="huge" paddingVertical="xxl">
            <Text variant="bodySmall" color="fgSubtle">
              Sem commits públicos recentes.
            </Text>
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileSkeleton() {
  const theme = useTheme<Theme>();
  return (
    <Box paddingHorizontal="huge" paddingTop="lg" paddingBottom="xxxl">
      <Box flexDirection="row" alignItems="center" gap="xxl" marginBottom="xxl">
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: theme.colors.surfaceMuted,
          }}
        />
        <Box flex={1} gap="md">
          <View
            style={{
              height: 18,
              width: '60%',
              borderRadius: 6,
              backgroundColor: theme.colors.surfaceMuted,
            }}
          />
          <View
            style={{
              height: 14,
              width: '40%',
              borderRadius: 6,
              backgroundColor: theme.colors.surfaceMuted,
            }}
          />
        </Box>
      </Box>
      <View
        style={{
          height: 14,
          width: '90%',
          borderRadius: 6,
          backgroundColor: theme.colors.surfaceMuted,
          marginBottom: 8,
        }}
      />
      <View
        style={{
          height: 14,
          width: '70%',
          borderRadius: 6,
          backgroundColor: theme.colors.surfaceMuted,
        }}
      />
    </Box>
  );
}

interface ErrorCardProps {
  message: string;
  onRetry: () => void;
}

function ErrorCard({ message, onRetry }: ErrorCardProps) {
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
      <Text variant="bodySmall" color="fgMuted" marginBottom="md">
        {message}
      </Text>
      <Pressable onPress={onRetry} hitSlop={8}>
        <Text variant="bodySmall" color="accent">
          Tentar novamente
        </Text>
      </Pressable>
    </Box>
  );
}
