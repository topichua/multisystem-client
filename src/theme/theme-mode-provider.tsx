import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ThemeModeContext } from "@/theme/theme-mode-context";
import type { ThemeMode, ThemePreference } from "@/theme/theme-mode.types";

const STORAGE_KEY = "lantoro-theme";

function readStoredPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "dark" || raw === "light" || raw === "system") {
      return raw;
    }
  } catch {
    // ignore
  }
  return "system";
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveMode(
  preference: ThemePreference,
  systemIsDark: boolean,
): ThemeMode {
  if (preference === "light") {
    return "light";
  }
  if (preference === "dark") {
    return "dark";
  }
  return systemIsDark ? "dark" : "light";
}

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(readStoredPreference);
  const [systemIsDark, setSystemIsDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (): void => {
      setSystemIsDark(mq.matches);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const mode = useMemo(
    () => resolveMode(preference, systemIsDark),
    [preference, systemIsDark],
  );

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const value = useMemo(
    () => ({ mode, preference, setPreference }),
    [mode, preference, setPreference],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};
