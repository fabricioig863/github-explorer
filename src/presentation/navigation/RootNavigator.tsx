import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { useTheme } from '@shopify/restyle';

import { TabsNavigator } from '@/presentation/navigation/TabsNavigator';
import { useThemeMode } from 'src/infra/theme/AppThemeProvider';
import type { Theme } from 'src/infra/theme/lightTheme';

/**
 * Cria theme do React Navigation usando tokens do app — sincroniza
 * fundo, bordas e cores com light/dark do tema atual.
 */
function buildNavTheme(appTheme: Theme, isDark: boolean): NavTheme {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: appTheme.colors.bg,
      card: appTheme.colors.bg,
      text: appTheme.colors.fg,
      border: appTheme.colors.border,
      primary: appTheme.colors.accent,
    },
  };
}

export function RootNavigator() {
  const { resolvedScheme } = useThemeMode();
  const appTheme = useTheme<Theme>();
  const navTheme = buildNavTheme(appTheme, resolvedScheme === 'dark');

  return (
    <NavigationContainer theme={navTheme}>
      <TabsNavigator />
    </NavigationContainer>
  );
}
