import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import { AutomationListContent } from "./automation-list-content";

const { Title } = Typography;

export const SettingsAutomationListView = () => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset data-qa="layout-settings-automation">
      <PaneDetailLayout.Header data-qa="layout-settings-automation-header">
        <Title level={4} style={{ margin: 0 }}>
          {t("automation.title")}
        </Title>
      </PaneDetailLayout.Header>

      <PaneDetailLayout.Body data-qa="layout-settings-automation-body">
        <AutomationListContent
          showActiveLabel
          emptyMarginTop={48}
          qa={{
            create: "settings-automation-create",
            tabs: "settings-automation-tabs",
            item: (ruleId) => `settings-automation-item-${ruleId}`,
            itemActive: (ruleId) => `settings-automation-item-active-${ruleId}`,
          }}
        />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
