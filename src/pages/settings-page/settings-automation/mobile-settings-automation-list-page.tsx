import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

import * as MobileS from "../mobile-settings-page.styled";
import { AutomationListContent } from "./automation-list-content";

export const MobileSettingsAutomationListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <MobileS.Root {...dataQaAttrs("settings-mobile-automation-page")}>
      <MobileS.PageHeader>
        <MobileS.TitleRow>
          <MobileS.IconBackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            data-qa="settings-mobile-automation-back"
            aria-label={t("automation.mobile.backToSettingsAria")}
            onClick={() => navigate(pagesMap.settings)}
          />
          <MobileS.PageTitle level={3}>
            {t("automation.title")}
          </MobileS.PageTitle>
        </MobileS.TitleRow>
      </MobileS.PageHeader>

      <MobileS.ScrollRegion>
        <MobileS.ContentSection>
          <AutomationListContent
            createButtonBlock
            qa={{
              create: "settings-mobile-automation-create",
              tabs: "settings-mobile-automation-tabs",
              item: (ruleId) => `settings-mobile-automation-item-${ruleId}`,
            }}
          />
        </MobileS.ContentSection>
      </MobileS.ScrollRegion>
    </MobileS.Root>
  );
};
