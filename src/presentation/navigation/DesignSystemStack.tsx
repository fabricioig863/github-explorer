import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@shopify/restyle';

import type { Theme } from '@/infrastructure/theme/lightTheme';
import type { DesignSystemStackParamList } from '@/presentation/navigation/types';
import { DesignSystemScreen } from '@/presentation/screens/DesignSystemScreen';

const Stack = createNativeStackNavigator<DesignSystemStackParamList>();

export function DesignSystemStack() {
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
      <Stack.Screen
        name="DesignSystem"
        component={DesignSystemScreen}
        options={{ title: 'Design System' }}
      />
    </Stack.Navigator>
  );
}
