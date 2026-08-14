import i18n from "@/i18n";

import type { WorkspaceLanguage } from "./workspace-settings.types";

export type UiLanguage = "uk" | "en";

export function toUiLanguage(language: WorkspaceLanguage): UiLanguage {
  return language === "ua" ? "uk" : "en";
}

export function toWorkspaceLanguage(uiLanguage: string): WorkspaceLanguage {
  return uiLanguage.startsWith("uk") ? "ua" : "en";
}

export function syncUiLanguage(language: WorkspaceLanguage): void {
  const uiLanguage = toUiLanguage(language);

  if (!i18n.language.startsWith(uiLanguage)) {
    void i18n.changeLanguage(uiLanguage);
  }
}
