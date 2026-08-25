import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsAutomationPath, pagesMap } from "@/app/router/pages-map";
import { useAutomationStore } from "@/features/automation/model/use-automation-store";
import { useNotification } from "@/shared/components/notification/use-notification";

export type AutomationListTabKey = "rules" | "settings";

export const useAutomationList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const store = useAutomationStore();
  const [activeTabKey, setActiveTabKey] =
    useState<AutomationListTabKey>("rules");

  useEffect(() => {
    void store.loadCriteria({ silent: true }).catch(() => undefined);
    void store.loadRules().catch((error) => {
      notification.error({
        message: getApiErrorMessage(error, t("automation.loadListError")),
      });
    });
  }, [notification, store, t]);

  const handleToggleActive = async (ruleId: number, isActive: boolean) => {
    try {
      await store.setRuleActive(ruleId, isActive);
    } catch (error) {
      notification.error({
        message: getApiErrorMessage(error, t("automation.activeToggleError")),
      });
    }
  };

  const description =
    activeTabKey === "settings"
      ? t("automation.settingsSectionHint")
      : t("automation.sectionHint");

  return {
    t,
    store,
    activeTabKey,
    setActiveTabKey,
    description,
    handleToggleActive,
    navigateToCreate: () => navigate(pagesMap.settingsAutomationNew),
    navigateToRule: (id: number) => navigate(getSettingsAutomationPath(id)),
  };
};
