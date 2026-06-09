import { Empty, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

const { Title } = Typography;

export const TeamPage = () => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header>
        <Title level={4} style={{ marginTop: 0 }}>
          {t("team.pageTitle")}
        </Title>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>
        <Empty description={t("team.placeholder")} />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
