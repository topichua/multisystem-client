import { createContext } from 'react';

import type { ThemeMode, ThemePreference } from '@/theme/theme-mode.types';

export const ThemeModeContext = createContext<{
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
} | null>(null);
