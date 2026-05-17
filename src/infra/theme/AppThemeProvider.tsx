import { ThemeProvider as RestyleThemeProvider } from '@shopify/restyle';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme } from 'src/infra/theme/darkTheme';
import { lightTheme } from 'src/infra/theme/lightTheme';
import { loadThemeMode, saveThemeMode, type ThemeMode } from 'src/infra/theme/themeStorage';

export interface ThemeModeContextValue {
  mode: ThemeMode;
  resolvedScheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  isHydrated: boolean;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadThemeMode().then((stored) => {
      if (!cancelled) {
        setModeState(stored);
        setIsHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    void saveThemeMode(next);
  };

  const resolvedScheme: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemScheme]);

  const activeTheme = resolvedScheme === 'dark' ? darkTheme : lightTheme;

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({ mode, resolvedScheme, setMode, isHydrated }),
    [mode, resolvedScheme, isHydrated],
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <RestyleThemeProvider theme={activeTheme}>{children}</RestyleThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (context === null) {
    throw new Error('useThemeMode must be used inside <AppThemeProvider>');
  }
  return context;
}
