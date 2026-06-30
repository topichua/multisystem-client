import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import * as FormS from "@/components/layout/form-card.styled";
import { SettingsInventorySection } from "./settings-inventory-section";
import { SettingsSystemPreferences } from "./settings-system-preferences";
import * as S from "./settings-system-view.styled";

export const SettingsSystemView = observer(() => {
  const { t } = useTranslation();

  return (
    <>
      <PaneDetailLayout.Root inset data-qa="layout-settings-system">
        <PaneDetailLayout.Header data-qa="layout-settings-system-header">
          <S.PageTitle level={4}>{t("system.title")}</S.PageTitle>
          <S.HeaderHint>{t("system.sectionHint")}</S.HeaderHint>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-settings-system-body">
          <S.CardsStack>
            <FormS.FormCard>
              <SettingsInventorySection />
            </FormS.FormCard>
            <FormS.FormCard>
              <SettingsSystemPreferences layout="desktop" />
            </FormS.FormCard>
          </S.CardsStack>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
