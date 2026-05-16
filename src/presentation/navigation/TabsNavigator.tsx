import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@shopify/restyle';
import { Compass, Palette } from 'lucide-react-native';

import type { Theme } from '@/infrastructure/theme/lightTheme';
import { DesignSystemStack } from '@/presentation/navigation/DesignSystemStack';
import { ExploreStack } from '@/presentation/navigation/ExploreStack';
import type { TabsParamList } from '@/presentation/navigation/types';

const Tabs = createBottomTabNavigator<TabsParamList>();

export function TabsNavigator() {
  const theme = useTheme<Theme>();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bg,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.colors.fg,
        tabBarInactiveTintColor: theme.colors.fgSubtle,
        tabBarLabelStyle: {
          fontFamily: 'Geist_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Compass size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="DesignSystemTab"
        component={DesignSystemStack}
        options={{
          title: 'Design System',
          tabBarIcon: ({ color }) => <Palette size={22} color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}
