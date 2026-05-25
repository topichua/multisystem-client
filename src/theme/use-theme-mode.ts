import { useContext } from 'react';

import { ThemeModeContext } from '@/theme/theme-mode-context';
import type { ThemeMode, ThemePreference } from '@/theme/theme-mode.types';

export const useThemeMode = (): {
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
} => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return ctx;
};
