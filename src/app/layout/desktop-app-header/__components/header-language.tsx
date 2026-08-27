import { CheckIcon } from "@phosphor-icons/react";
import { Button, Dropdown, Flex, Typography } from "antd";
import type { MenuProps } from "antd";
import { observer } from "mobx-react-lite";
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

const LANGUAGE_OPTIONS = {
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

export const HeaderLanguage = observer(() => {
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

  const handleLanguageClick: NonNullable<MenuProps["onClick"]> = async ({
    key,
  }) => {
    if (!isUiLanguage(key) || key === language || languageDisabled) {
      return;
    }

    const previousLanguage = language;

    try {
      await i18n.changeLanguage(key);

      await workspaceSettingsStore.updateLanguage(toWorkspaceLanguage(key));
    } catch (error) {
      await i18n.changeLanguage(previousLanguage);

      notification.error({
        title: getApiErrorMessage(error, t("system.languageSaveError")),
      });
    }
  };

  const languageMenuItems: MenuProps["items"] = Object.entries(
    LANGUAGE_OPTIONS,
  ).map(([key, option]) => {
    const selected = key === language;

    return {
      key,
      disabled: languageDisabled,
      label: (
        <Flex align="center" justify="space-between" gap={16}>
          <Flex align="center" gap={14}>
            <Typography.Text type={selected ? undefined : "secondary"} strong>
              {option.code}
            </Typography.Text>

            <Typography.Text type={selected ? undefined : "secondary"}>
              {t(option.labelKey)}
            </Typography.Text>
          </Flex>

          {selected && <CheckIcon size={14} color='purple' weight="bold" />}
        </Flex>
      ),
    };
  });

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: languageMenuItems,
        selectedKeys: [language],
        onClick: handleLanguageClick,
      }}
    >
      <Button
        type="text"
        disabled={languageDisabled}
        aria-label={t("appHeader.changeLanguage")}
        data-qa="layout-desktop-language-dropdown"
        style={{ paddingLeft: 8, paddingRight: 8 }}
      >
        {LANGUAGE_OPTIONS[language].code}
      </Button>
    </Dropdown>
  );
});
