import { Empty } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import {
  PaneSectionHint,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";

type AnalyticsSectionPlaceholderProps = {
  titleKey: string;
  descriptionKey: string;
};

export const AnalyticsSectionPlaceholder = ({
  titleKey,
  descriptionKey,
}: AnalyticsSectionPlaceholderProps) => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header>
        <PaneSectionTitle>{t(titleKey)}</PaneSectionTitle>
        <PaneSectionHint>{t(descriptionKey)}</PaneSectionHint>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>
        <Empty description={t("analytics.placeholder")} />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
