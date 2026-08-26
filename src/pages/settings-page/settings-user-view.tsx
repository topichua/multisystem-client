import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionHint } from "@/components/layout/pane-frame";

import { SettingsUserEmailCard } from "./settings-user-email-card";
import { SettingsUserPasswordCard } from "./settings-user-password-card";
import { SettingsUserProfileCard } from "./settings-user-profile-card";
import * as S from "./settings-user-view.styled";

const { Title } = Typography;

export const SettingsUserView = () => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset data-qa="layout-settings-user">
      <PaneDetailLayout.Header data-qa="layout-settings-user-header">
        <Title level={4} style={{ marginTop: 0 }}>
          {t("userSettings.title")}
        </Title>
        <PaneSectionHint style={{ marginTop: 0 }}>
          {t("userSettings.subtitle")}
        </PaneSectionHint>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body data-qa="layout-settings-user-body">
        <S.CardsStack>
          <SettingsUserProfileCard />
          <SettingsUserEmailCard />
          <SettingsUserPasswordCard />
        </S.CardsStack>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
