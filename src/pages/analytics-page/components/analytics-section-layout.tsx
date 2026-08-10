import type { ReactNode } from "react";
import { Flex } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import {
  PaneSectionHint,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";

type AnalyticsSectionLayoutProps = {
  titleKey: string;
  descriptionKey: string;
  titleExtra?: ReactNode;
  children: ReactNode;
};

export const AnalyticsSectionLayout = ({
  titleKey,
  descriptionKey,
  titleExtra,
  children,
}: AnalyticsSectionLayoutProps) => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header>
        <Flex align="center" gap={8} wrap>
          <PaneSectionTitle>{t(titleKey)}</PaneSectionTitle>
          {titleExtra}
        </Flex>
        <PaneSectionHint>{t(descriptionKey)}</PaneSectionHint>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>{children}</PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
