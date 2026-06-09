import { Empty } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";

export const TeamRolesPage = () => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header data-qa="layout-team-roles-header">
        <PaneSectionTitle>{t("team.rolesTitle")}</PaneSectionTitle>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>
        <Empty description={t("team.rolesPlaceholder")} />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
