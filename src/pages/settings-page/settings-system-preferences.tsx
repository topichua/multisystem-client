import { Alert, Radio, Select } from "antd";
import type { ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  WORKSPACE_CURRENCIES,
  type WorkspaceCurrency,
} from "@/features/workspace-settings/model/workspace-settings.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import type { ThemePreference } from "@/theme/theme-mode.types";
import { useThemeMode } from "@/theme/use-theme-mode";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as DesktopS from "@/components/layout/form-card.styled";
import * as MobileS from "./mobile-settings-page.styled";

type SettingsSystemPreferencesProps = {
  layout?: "desktop" | "mobile";
};

export const SettingsSystemPreferences = observer(
  ({ layout = "desktop" }: SettingsSystemPreferencesProps) => {
    const { t, i18n } = useTranslation();
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

    const loadErrorAlert = workspaceSettingsStore.loadError ? (
      <Alert
        type="error"
        title={t("system.settingsLoadError")}
        description={workspaceSettingsStore.loadError}
        showIcon
        style={{ marginBottom: isMobile ? 16 : 24 }}
      />
    ) : null;

    const currencySelect = (
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
        style={isMobile ? { width: "100%" } : { width: 180 }}
        onChange={(value) => void handleCurrencyChange(value)}
      />
    );

    const wrapMobileRadioGroup = (node: ReactNode) =>
      isMobile ? (
        <MobileS.FullWidthRadioGroup>{node}</MobileS.FullWidthRadioGroup>
      ) : (
        node
      );

    const languageControl = wrapMobileRadioGroup(
      <Radio.Group
        value={langValue}
        onChange={(e) => {
          void i18n.changeLanguage(e.target.value);
        }}
        optionType="button"
        buttonStyle="solid"
        style={isMobile ? { display: "flex", width: "100%" } : undefined}
      >
        <Radio.Button
          value="en"
          style={isMobile ? { flex: 1, textAlign: "center" } : undefined}
        >
          {t("system.english")}
        </Radio.Button>
        <Radio.Button
          value="uk"
          style={isMobile ? { flex: 1, textAlign: "center" } : undefined}
        >
          {t("system.ukrainian")}
        </Radio.Button>
      </Radio.Group>,
    );

    const themeControl = wrapMobileRadioGroup(
      <Radio.Group
        value={preference}
        onChange={(e) => {
          setPreference(e.target.value as ThemePreference);
        }}
        optionType="button"
        buttonStyle="solid"
        style={isMobile ? { display: "flex", width: "100%" } : undefined}
      >
        <Radio.Button
          value="light"
          style={isMobile ? { flex: 1, textAlign: "center" } : undefined}
        >
          {t("system.light")}
        </Radio.Button>
        <Radio.Button
          value="dark"
          style={isMobile ? { flex: 1, textAlign: "center" } : undefined}
        >
          {t("system.dark")}
        </Radio.Button>
        <Radio.Button
          value="system"
          style={isMobile ? { flex: 1, textAlign: "center" } : undefined}
        >
          {t("system.themeAuto")}
        </Radio.Button>
      </Radio.Group>,
    );

    if (isMobile) {
      return (
        <>
          {loadErrorAlert}

          <MobileS.SectionGroup>
            <MobileS.SectionTitle>
              {t("system.mobile.workspaceSection")}
            </MobileS.SectionTitle>

            <MobileS.PreferenceBlock>
              <MobileS.PreferenceLabel>
                {t("system.currency")}
              </MobileS.PreferenceLabel>
              {currencySelect}
            </MobileS.PreferenceBlock>

            <MobileS.PreferenceBlock>
              <MobileS.PreferenceLabel>
                {t("system.language")}
              </MobileS.PreferenceLabel>
              {languageControl}
            </MobileS.PreferenceBlock>
          </MobileS.SectionGroup>

          <MobileS.MobileFormDivider />

          <MobileS.SectionGroup>
            <MobileS.SectionTitle>
              {t("system.mobile.appearanceSection")}
            </MobileS.SectionTitle>

            <MobileS.PreferenceBlock>
              <MobileS.PreferenceLabel>
                {t("system.theme")}
              </MobileS.PreferenceLabel>
              {themeControl}
            </MobileS.PreferenceBlock>
          </MobileS.SectionGroup>
        </>
      );
    }

    return (
      <>
        {loadErrorAlert}

        <DesktopS.SettingSection>
          <DesktopS.SettingLabel>{t("system.currency")}</DesktopS.SettingLabel>
          {currencySelect}
        </DesktopS.SettingSection>

        <DesktopS.FormDivider />

        <DesktopS.SettingSection>
          <DesktopS.SettingLabel>{t("system.language")}</DesktopS.SettingLabel>
          {languageControl}
        </DesktopS.SettingSection>

        <DesktopS.FormDivider />

        <DesktopS.SettingSection>
          <DesktopS.SettingLabel>{t("system.theme")}</DesktopS.SettingLabel>
          {themeControl}
        </DesktopS.SettingSection>
      </>
    );
  },
);
