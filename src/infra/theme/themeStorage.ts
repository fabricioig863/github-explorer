import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = '@github-explorer:theme-mode';

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch {
  }
}
