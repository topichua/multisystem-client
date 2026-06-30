import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

import * as MobileS from "./mobile-settings-page.styled";
import { SettingsInventorySection } from "./settings-inventory-section";
import { SettingsSystemPreferences } from "./settings-system-preferences";

export const MobileSettingsSystemPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <MobileS.Root {...dataQaAttrs("settings-mobile-system-page")}>
      <MobileS.PageHeader>
        <MobileS.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          data-qa="settings-mobile-system-back"
          aria-label={t("system.mobile.backToSettingsAria")}
          onClick={() => navigate(pagesMap.settings)}
        >
          {t("settings.title")}
        </MobileS.BackButton>

        <MobileS.HeaderCopy>
          <MobileS.PageTitle level={3}>{t("system.title")}</MobileS.PageTitle>
          <MobileS.PageSubtitle>{t("system.sectionHint")}</MobileS.PageSubtitle>
        </MobileS.HeaderCopy>
      </MobileS.PageHeader>

      <MobileS.ScrollRegion>
        <MobileS.ContentSection>
          <SettingsInventorySection layout="mobile" />

          <MobileS.MobileFormDivider />

          <SettingsSystemPreferences layout="mobile" />
        </MobileS.ContentSection>
      </MobileS.ScrollRegion>
    </MobileS.Root>
  );
};
