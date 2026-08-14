import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import { FormCard } from "@/components/layout/form-card";
import { SettingsInventorySection } from "./settings-inventory-section";
import { SettingsSystemPreferences } from "./settings-system-preferences";
import { SettingsWishlistSection } from "./settings-wishlist-section";
import { SettingsWorkScheduleSection } from "./settings-work-schedule-section";
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
            <FormCard>
              <SettingsSystemPreferences layout="desktop" />
            </FormCard>
            <FormCard>
              <SettingsWorkScheduleSection />
            </FormCard>
            <FormCard>
              <SettingsInventorySection />
            </FormCard>
            <FormCard>
              <SettingsWishlistSection />
            </FormCard>
          </S.CardsStack>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
