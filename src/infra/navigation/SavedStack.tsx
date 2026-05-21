import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@shopify/restyle';

import { IssuesScreen } from '@/presentation/screens/IssuesScreen';
import { RepoDetailScreen } from '@/presentation/screens/RepoDetailScreen';
import { SavedScreen } from '@/presentation/screens/SavedScreen';
import type { SavedStackParamList } from 'src/infra/navigation/types';
import type { Theme } from 'src/infra/theme/lightTheme';

const Stack = createNativeStackNavigator<SavedStackParamList>();

export function SavedStack() {
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
      <Stack.Screen name="Saved" component={SavedScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RepoDetail"
        component={RepoDetailScreen}
        options={{ title: 'Detalhes' }}
      />
      <Stack.Screen name="Issues" component={IssuesScreen} options={{ title: 'Issues' }} />
    </Stack.Navigator>
  );
}
