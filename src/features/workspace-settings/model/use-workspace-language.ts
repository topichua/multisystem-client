import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  toUiLanguage,
  toWorkspaceLanguage,
  type UiLanguage,
} from "@/features/workspace-settings/model/workspace-language";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { useNotification } from "@/shared/components/notification/use-notification";

export const LANGUAGE_OPTIONS = {
  uk: {
    code: "UA",
    labelKey: "system.ukrainian",
  },
  en: {
    code: "EN",
    labelKey: "system.english",
  },
} as const satisfies Record<
  UiLanguage,
  {
    code: string;
    labelKey: "system.ukrainian" | "system.english";
  }
>;

const isUiLanguage = (value: string): value is UiLanguage =>
  value in LANGUAGE_OPTIONS;

export const useWorkspaceLanguage = () => {
  const { t, i18n } = useTranslation();
  const notification = useNotification();
  const workspaceSettingsStore = useWorkspaceSettingsStore();

  const language: UiLanguage = workspaceSettingsStore.language
    ? toUiLanguage(workspaceSettingsStore.language)
    : i18n.language.startsWith("uk")
      ? "uk"
      : "en";

  const languageDisabled =
    workspaceSettingsStore.loadLoading ||
    workspaceSettingsStore.languageSaveLoading ||
    !workspaceSettingsStore.currency;

  useEffect(() => {
    if (
      workspaceSettingsStore.initialized ||
      workspaceSettingsStore.loadLoading
    ) {
      return;
    }

    void workspaceSettingsStore
      .loadSettings({ silent: true })
      .catch(() => undefined);
  }, [
    workspaceSettingsStore,
    workspaceSettingsStore.initialized,
    workspaceSettingsStore.loadLoading,
  ]);

  const changeLanguage = async (nextLanguage: string) => {
    if (
      !isUiLanguage(nextLanguage) ||
      nextLanguage === language ||
      languageDisabled
    ) {
      return;
    }

    const previousLanguage = language;

    try {
      await i18n.changeLanguage(nextLanguage);
      await workspaceSettingsStore.updateLanguage(
        toWorkspaceLanguage(nextLanguage),
      );
    } catch (error) {
      await i18n.changeLanguage(previousLanguage);

      notification.error({
        title: getApiErrorMessage(error, t("system.languageSaveError")),
      });
    }
  };

  return {
    language,
    languageDisabled,
    changeLanguage,
  };
};
