import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import {
  PaneSectionHint,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";

type AnalyticsSectionLayoutProps = {
  titleKey: string;
  descriptionKey: string;
  children: ReactNode;
};

export const AnalyticsSectionLayout = ({
  titleKey,
  descriptionKey,
  children,
}: AnalyticsSectionLayoutProps) => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header>
        <PaneSectionTitle>{t(titleKey)}</PaneSectionTitle>
        <PaneSectionHint>{t(descriptionKey)}</PaneSectionHint>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>{children}</PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
