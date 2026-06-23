import { Empty, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

const { Title } = Typography;

export const AnalyticsPage = () => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header>
        <Title level={4} style={{ marginTop: 0 }}>
          {t("analytics.pageTitle")}
        </Title>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>
        <Empty description="Page under construction" />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
