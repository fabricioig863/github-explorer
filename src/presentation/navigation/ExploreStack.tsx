import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@shopify/restyle';

import type { Theme } from '@/infrastructure/theme/lightTheme';
import type { ExploreStackParamList } from '@/presentation/navigation/types';
import { IssuesScreen } from '@/presentation/screens/IssuesScreen';
import { RepoDetailScreen } from '@/presentation/screens/RepoDetailScreen';
import { SearchScreen } from '@/presentation/screens/SearchScreen';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export function ExploreStack() {
  const theme = useTheme<Theme>();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.fg,
        headerTitleStyle: { fontFamily: 'Geist_600SemiBold', fontSize: 16 },
        contentStyle: { backgroundColor: theme.colors.bg },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Explorar' }} />
      <Stack.Screen
        name="RepoDetail"
        component={RepoDetailScreen}
        options={{ title: 'Detalhes' }}
      />
      <Stack.Screen name="Issues" component={IssuesScreen} options={{ title: 'Issues' }} />
    </Stack.Navigator>
  );
}
