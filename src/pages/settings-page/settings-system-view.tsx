import { Alert, Radio, Select, Typography, message } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionHint } from "@/components/layout/pane-frame";
import {
  WORKSPACE_CURRENCIES,
  type WorkspaceCurrency,
} from "@/features/workspace-settings/model/workspace-settings.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import type { ThemePreference } from "@/theme/theme-mode.types";
import { useThemeMode } from "@/theme/use-theme-mode";

import * as S from "@/components/layout/form-card.styled";

const { Title } = Typography;

export const SettingsSystemView = observer(() => {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useThemeMode();
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const [messageApi, contextHolder] = message.useMessage();

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
        messageApi.error(getApiErrorMessage(e, t("system.currencySaveError")));
      }
    },
    [messageApi, t, workspaceSettingsStore],
  );

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root inset data-qa="layout-settings-system">
        <PaneDetailLayout.Header data-qa="layout-settings-system-header">
          <Title level={4} style={{ marginTop: 0 }}>
            {t("system.title")}
          </Title>
          <PaneSectionHint style={{ marginTop: 0 }}>
            {t("system.sectionHint")}
          </PaneSectionHint>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-settings-system-body">
          <S.FormCard>
            {workspaceSettingsStore.loadError ? (
              <Alert
                type="error"
                message={t("system.settingsLoadError")}
                description={workspaceSettingsStore.loadError}
                showIcon
                style={{ marginBottom: 24 }}
              />
            ) : null}

            <S.SettingSection>
              <S.SettingLabel>{t("system.currency")}</S.SettingLabel>
              <Select<WorkspaceCurrency>
                value={workspaceSettingsStore.currency ?? undefined}
                placeholder={t("system.currencyPlaceholder")}
                loading={
                  workspaceSettingsStore.loadLoading ||
                  workspaceSettingsStore.saveLoading
                }
                disabled={
                  workspaceSettingsStore.loadLoading ||
                  workspaceSettingsStore.saveLoading
                }
                options={WORKSPACE_CURRENCIES.map((currency) => ({
                  value: currency,
                  label: t(`system.currencies.${currency}`),
                }))}
                style={{ width: 180 }}
                onChange={(value) => void handleCurrencyChange(value)}
              />
            </S.SettingSection>

            <S.FormDivider />

            <S.SettingSection>
              <S.SettingLabel>{t("system.language")}</S.SettingLabel>
              <Radio.Group
                value={langValue}
                onChange={(e) => {
                  void i18n.changeLanguage(e.target.value);
                }}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="en">{t("system.english")}</Radio.Button>
                <Radio.Button value="uk">{t("system.ukrainian")}</Radio.Button>
              </Radio.Group>
            </S.SettingSection>

            <S.FormDivider />

            <S.SettingSection>
              <S.SettingLabel>{t("system.theme")}</S.SettingLabel>
              <Radio.Group
                value={preference}
                onChange={(e) => {
                  setPreference(e.target.value as ThemePreference);
                }}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="light">{t("system.light")}</Radio.Button>
                <Radio.Button value="dark">{t("system.dark")}</Radio.Button>
                <Radio.Button value="system">
                  {t("system.themeAuto")}
                </Radio.Button>
              </Radio.Group>
            </S.SettingSection>
          </S.FormCard>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
