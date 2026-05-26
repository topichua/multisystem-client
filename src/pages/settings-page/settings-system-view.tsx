import { Radio, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import type { ThemePreference } from "@/theme/theme-mode.types";
import { useThemeMode } from "@/theme/use-theme-mode";

const { Title, Paragraph } = Typography;

export const SettingsSystemView = () => {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useThemeMode();

  const langValue = i18n.language.startsWith("uk") ? "uk" : "en";

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header>
        <Title level={4} style={{ marginTop: 0 }}>
          {t("system.title")}
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {t("system.sectionHint")}
        </Paragraph>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>
        <div style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 24 }}>
            <Paragraph strong style={{ marginBottom: 8 }}>
              {t("system.language")}
            </Paragraph>
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
          </div>

          <div>
            <Paragraph strong style={{ marginBottom: 8 }}>
              {t("system.theme")}
            </Paragraph>
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
          </div>
        </div>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
