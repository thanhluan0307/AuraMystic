import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKGROUNDS, DEFAULT_BACKGROUNDS, resolveBackground, type BackgroundOption } from './backgrounds';
import { goldColors, tiffanyColors } from './palettes';

export type ThemeId = 'gold' | 'tiffany';
export interface AppTheme {
  id: ThemeId;
  name: string;
  colors: typeof goldColors;
}
export const THEMES: Record<ThemeId, AppTheme> = {
  gold: { id: 'gold', name: 'Vàng hiện tại', colors: goldColors },
  tiffany: { id: 'tiffany', name: 'Xanh Tiffany', colors: tiffanyColors },
};
const STORAGE_KEY = '@tl_color_theme';
const backgroundStorageKey = (id: ThemeId) => `@tl_background_${id}`;
interface ThemeContextValue {
  theme: AppTheme;
  ready: boolean;
  background: BackgroundOption;
  selectBackground: (themeId: ThemeId, id: string) => Promise<void>;
  selectTheme: (id: ThemeId) => Promise<void>;
}
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('gold');
  const [backgroundIds, setBackgroundIds] = useState(DEFAULT_BACKGROUNDS);
  const [ready, setReady] = useState(false);
  const pendingSave = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY).catch(() => null),
      AsyncStorage.getItem(backgroundStorageKey('gold')).catch(() => null),
      AsyncStorage.getItem(backgroundStorageKey('tiffany')).catch(() => null),
    ]).then(([savedTheme, gold, tiffany]) => {
      if (!active) return;
      if (savedTheme === 'gold' || savedTheme === 'tiffany') setThemeId(savedTheme);
      setBackgroundIds({
        gold: resolveBackground('gold', gold).id,
        tiffany: resolveBackground('tiffany', tiffany).id,
      });
      setReady(true);
    });
    return () => { active = false; };
  }, []);
  const value = useMemo<ThemeContextValue>(() => ({
    theme: THEMES[themeId],
    ready,
    background: resolveBackground(themeId, backgroundIds[themeId]),
    selectBackground: (id, backgroundId) => {
      if (!BACKGROUNDS[id].some((option) => option.id === backgroundId)) {
        return Promise.reject(new Error('Background does not belong to this theme'));
      }
      setBackgroundIds((current) => ({ ...current, [id]: backgroundId }));
      const save = pendingSave.current.catch(() => {}).then(() =>
        AsyncStorage.setItem(backgroundStorageKey(id), backgroundId));
      pendingSave.current = save;
      return save;
    },
    selectTheme: (id) => {
      setThemeId(id);
      // Keep rapid selections in order so the last choice is persisted.
      const save = pendingSave.current.catch(() => {}).then(() => AsyncStorage.setItem(STORAGE_KEY, id));
      pendingSave.current = save;
      return save;
    },
  }), [themeId, ready, backgroundIds]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

export function useThemeStyles<T>(factory: (theme: AppTheme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}

export function withOpacity(hex: string, opacity: number): string {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  return `rgba(${channels.join(', ')}, ${opacity})`;
}
