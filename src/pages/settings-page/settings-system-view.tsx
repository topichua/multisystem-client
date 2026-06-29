import { Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionHint } from "@/components/layout/pane-frame";

import * as S from "@/components/layout/form-card.styled";
import { SettingsSystemPreferences } from "./settings-system-preferences";

const { Title } = Typography;

export const SettingsSystemView = observer(() => {
  const { t } = useTranslation();

  return (
    <>
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
            <SettingsSystemPreferences layout="desktop" />
          </S.FormCard>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
