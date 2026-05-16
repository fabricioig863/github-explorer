import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { QueryProvider } from '@/infrastructure/query/QueryProvider';
import { AppThemeProvider } from '@/infrastructure/theme/AppThemeProvider';
import { useAppFonts } from '@/infrastructure/theme/fonts';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';

// dentro de App, fora do return:

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontsError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontsError !== null) {
      void SplashScreen.hideAsync();
    }
    void AsyncStorage.removeItem('@github-explorer:theme-mode');
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
