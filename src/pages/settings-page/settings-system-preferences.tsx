import {
  CurrencyDollarIcon,
  DesktopIcon,
  MoonIcon,
  SunIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import { Alert, Flex, Segmented, Select, Spin, Typography, theme } from "antd";
import type { ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { FormDivider } from "@/components/layout/form-card";
import {
  WORKSPACE_CURRENCIES,
  type WorkspaceCurrency,
} from "@/features/workspace-settings/model/workspace-settings.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import type { ThemePreference } from "@/theme/theme-mode.types";
import { useThemeMode } from "@/theme/use-theme-mode";
import { useNotification } from "@/shared/components/notification/use-notification";

import { SettingsPreferenceRow } from "./components/settings-preference-row";
import { SettingsSectionHeader } from "./components/settings-section-header";
import * as MobileS from "./mobile-settings-page.styled";

const { Text } = Typography;

type SettingsSystemPreferencesProps = {
  layout?: "desktop" | "mobile";
};

function segmentedOptionLabel(icon: ReactNode, label: string) {
  return (
    <Flex align="center" gap={6} justify="center">
      {icon}
      <span>{label}</span>
    </Flex>
  );
}

export const SettingsSystemPreferences = observer(
  ({ layout = "desktop" }: SettingsSystemPreferencesProps) => {
    const { t, i18n } = useTranslation();
    const { token } = theme.useToken();
    const { preference, setPreference } = useThemeMode();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const notification = useNotification();
    const isMobile = layout === "mobile";

    const langValue = i18n.language.startsWith("uk") ? "uk" : "en";

    useEffect(() => {
      if (
        !workspaceSettingsStore.initialized &&
        !workspaceSettingsStore.loadLoading
      ) {
        void workspaceSettingsStore.loadSettings();
      }
    }, [workspaceSettingsStore]);

    const handleCurrencyChange = useCallback(
      async (currency: WorkspaceCurrency) => {
        try {
          await workspaceSettingsStore.updateCurrency(currency);
        } catch (e) {
          notification.error({
            title: getApiErrorMessage(e, t("system.currencySaveError")),
          });
        }
      },
      [notification, t, workspaceSettingsStore],
    );

    const languageOptions = useMemo(
      () => [
        { value: "en", label: t("system.english") },
        { value: "uk", label: t("system.ukrainian") },
      ],
      [t],
    );

    const themeOptions = useMemo(
      () => [
        {
          value: "light",
          label: segmentedOptionLabel(
            <SunIcon size={16} />,
            t("system.light"),
          ),
        },
        {
          value: "dark",
          label: segmentedOptionLabel(
            <MoonIcon size={16} />,
            t("system.dark"),
          ),
        },
        {
          value: "system",
          label: segmentedOptionLabel(
            <DesktopIcon size={16} />,
            t("system.themeAuto"),
          ),
        },
      ],
      [t],
    );

    const loadErrorAlert = workspaceSettingsStore.loadError ? (
      <Alert
        type="error"
        title={t("system.settingsLoadError")}
        description={workspaceSettingsStore.loadError}
        showIcon
        style={{ marginBottom: isMobile ? 16 : 20 }}
      />
    ) : null;

    const currencyControl = (
      <Select<WorkspaceCurrency>
        value={workspaceSettingsStore.currency ?? undefined}
        placeholder={t("system.currencyPlaceholder")}
        loading={
          workspaceSettingsStore.loadLoading ||
          workspaceSettingsStore.currencySaveLoading
        }
        disabled={
          workspaceSettingsStore.loadLoading ||
          workspaceSettingsStore.currencySaveLoading
        }
        options={WORKSPACE_CURRENCIES.map((currency) => ({
          value: currency,
          label: t(`system.currencies.${currency}`),
        }))}
        style={isMobile ? { width: "100%" } : { minWidth: 112 }}
        onChange={(value) => void handleCurrencyChange(value)}
      />
    );

    const languageControl = (
      <Segmented
        block={isMobile}
        value={langValue}
        options={languageOptions}
        onChange={(value) => {
          void i18n.changeLanguage(String(value));
        }}
      />
    );

    const themeControl = (
      <Segmented
        block={isMobile}
        value={preference}
        options={themeOptions}
        onChange={(value) => {
          setPreference(value as ThemePreference);
        }}
        style={isMobile ? undefined : { maxWidth: 420 }}
      />
    );

    const preferenceRows = (
      <>
        <SettingsPreferenceRow
          icon={<CurrencyDollarIcon size={20} />}
          title={t("system.currency")}
          description={t("system.currencyDescription")}
          control={currencyControl}
          stackControl={isMobile}
        />

        <FormDivider style={{ margin: `${token.marginLG}px 0` }} />

        <SettingsPreferenceRow
          icon={<TranslateIcon size={20} />}
          title={t("system.language")}
          description={t("system.languageDescription")}
          control={languageControl}
          stackControl={isMobile}
        />

        <FormDivider style={{ margin: `${token.marginLG}px 0` }} />

        <SettingsPreferenceRow
          icon={<SunIcon size={20} />}
          title={t("system.theme")}
          description={t("system.themeDescription")}
          control={themeControl}
          stackControl={isMobile}
        />
      </>
    );

    if (isMobile) {
      return (
        <Spin
          spinning={
            workspaceSettingsStore.loadLoading && !workspaceSettingsStore.initialized
          }
        >
          {loadErrorAlert}

          <MobileS.SectionGroup>
            <MobileS.SectionTitle>
              {t("system.preferences.title")}
            </MobileS.SectionTitle>
            <MobileS.PreferenceBlock>
              <Text type="secondary">{t("system.preferences.description")}</Text>
              {preferenceRows}
            </MobileS.PreferenceBlock>
          </MobileS.SectionGroup>
        </Spin>
      );
    }

    return (
      <Spin spinning={workspaceSettingsStore.loadLoading && !workspaceSettingsStore.initialized}>
        {loadErrorAlert}

        <SettingsSectionHeader
          title={t("system.preferences.title")}
          description={t("system.preferences.description")}
        />

        {preferenceRows}
      </Spin>
    );
  },
);
