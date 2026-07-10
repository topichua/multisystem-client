import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

import * as MobileS from "./mobile-settings-page.styled";
import { SettingsBillingContent } from "./settings-billing/settings-billing-content";

export const MobileSettingsBillingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <MobileS.Root {...dataQaAttrs("settings-mobile-billing-page")}>
      <MobileS.PageHeader>
        <MobileS.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          data-qa="settings-mobile-billing-back"
          aria-label={t("billing.mobile.backToSettingsAria")}
          onClick={() => navigate(pagesMap.settings)}
        >
          {t("settings.title")}
        </MobileS.BackButton>

        <MobileS.HeaderCopy>
          <MobileS.PageTitle level={3}>{t("billing.title")}</MobileS.PageTitle>
          <MobileS.PageSubtitle>{t("billing.sectionHint")}</MobileS.PageSubtitle>
        </MobileS.HeaderCopy>
      </MobileS.PageHeader>

      <MobileS.ScrollRegion>
        <MobileS.ContentSection>
          <SettingsBillingContent layout="mobile" />
        </MobileS.ContentSection>
      </MobileS.ScrollRegion>
    </MobileS.Root>
  );
};
