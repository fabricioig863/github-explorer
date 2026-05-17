import 'src/infra/reactotron/ReactotronConfig';

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { RootNavigator } from 'src/infra/navigation/RootNavigator';
import { QueryProvider } from 'src/infra/query/QueryProvider';
import { AppThemeProvider } from 'src/infra/theme/AppThemeProvider';
import { useAppFonts } from 'src/infra/theme/fonts';

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontsError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontsError !== null) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && fontsError === null) {
    return null;
  }

  return (
    <QueryProvider>
      <AppThemeProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AppThemeProvider>
    </QueryProvider>
  );
}
