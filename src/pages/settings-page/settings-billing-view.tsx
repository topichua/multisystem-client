import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import * as S from "./settings-system-view.styled";
import { SettingsBillingContent } from "./settings-billing/settings-billing-content";

export const SettingsBillingView = observer(() => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset data-qa="layout-settings-billing">
      <PaneDetailLayout.Header data-qa="layout-settings-billing-header">
        <S.PageTitle level={4}>{t("billing.title")}</S.PageTitle>
        <S.HeaderHint>{t("billing.sectionHint")}</S.HeaderHint>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body data-qa="layout-settings-billing-body">
        <SettingsBillingContent layout="desktop" />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
