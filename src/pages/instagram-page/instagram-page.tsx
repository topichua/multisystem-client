import { Empty, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

const { Title } = Typography;

export const InstagramPage = () => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header>
        <Title level={4} style={{ marginTop: 0 }}>
          {t("instagram.pageTitle")}
        </Title>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>
        <Empty description={t("instagram.placeholder")} />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
