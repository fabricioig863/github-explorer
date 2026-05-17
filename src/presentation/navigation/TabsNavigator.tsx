import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@shopify/restyle';
import { Compass, User } from 'lucide-react-native';

import { ExploreStack } from '@/presentation/navigation/ExploreStack';
import type { TabsParamList } from '@/presentation/navigation/types';
import { ProfileScreen } from '@/presentation/screens/ProfileScreen';
import type { Theme } from 'src/infra/theme/lightTheme';

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
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} fill={focused ? color : 'transparent'} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
