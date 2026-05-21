import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@shopify/restyle';
import { Bookmark, Compass } from 'lucide-react-native';

import { SavedScreen } from '@/presentation/screens/SavedScreen';
import { ExploreStack } from 'src/infra/navigation/ExploreStack';
import type { TabsParamList } from 'src/infra/navigation/types';
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
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('ExploreTab', { screen: 'Search' });
          },
        })}
      />
      <Tabs.Screen
        name="SavedTab"
        component={SavedScreen}
        options={{
          title: 'Salvos',
          tabBarIcon: ({ color, focused }) => (
            <Bookmark size={22} color={color} fill={focused ? color : 'transparent'} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
