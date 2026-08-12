import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Empty, Flex, Switch, Tabs } from "antd";
import type { TabsProps } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsAutomationPath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { formatAutomationRuleSummary } from "@/features/automation/model/format-automation-rule-summary";
import { useAutomationStore } from "@/features/automation/model/use-automation-store";
import { useNotification } from "@/shared/components/notification/use-notification";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

import * as MobileS from "../mobile-settings-page.styled";
import { AutomationChannelSettings } from "./automation-channel-settings";
import * as S from "./settings-automation.styled";

type AutomationListTabKey = "rules" | "settings";

export const MobileSettingsAutomationListPage = observer(() => {
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

  const tabs: TabsProps["items"] = [
    {
      key: "rules",
      label: t("automation.tabs.rules"),
      children: (
        <>
          {store.listError && (
            <Alert type="error" title={store.listError} showIcon />
          )}

          {store.listLoading && store.rules.length === 0 ? (
            <CenteredSpinner />
          ) : store.rules.length === 0 ? (
            <Empty description={t("automation.empty")} />
          ) : (
            <S.ListStack>
              {store.rules.map((rule) => (
                <S.ListItem
                  key={rule.id}
                  type="button"
                  onClick={() => navigate(getSettingsAutomationPath(rule.id))}
                  data-qa={`settings-mobile-automation-item-${rule.id}`}
                >
                  <S.ListItemHeader>
                    <S.ListItemTitle>{rule.name}</S.ListItemTitle>
                    <div
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <Flex align="center" gap={8}>
                        <Switch
                          checked={rule.isActive}
                          loading={store.activeToggleLoadingId === rule.id}
                          onChange={(checked) => {
                            void handleToggleActive(rule.id, checked);
                          }}
                        />
                      </Flex>
                    </div>
                  </S.ListItemHeader>
                  <S.ListItemSummary>
                    {formatAutomationRuleSummary(rule, store.criteria, t)}
                  </S.ListItemSummary>
                </S.ListItem>
              ))}
            </S.ListStack>
          )}
        </>
      ),
    },
    {
      key: "settings",
      label: t("automation.tabs.settings"),
      children: <AutomationChannelSettings />,
    },
  ];

  const description =
    activeTabKey === "settings"
      ? t("automation.settingsSectionHint")
      : t("automation.sectionHint");

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
          <S.ListContentRoot>
            <S.ListIntroRow>
              <S.ListDescription>{description}</S.ListDescription>
              {activeTabKey === "rules" && (
                <Button
                  type="primary"
                  block
                  icon={<PlusIcon />}
                  data-qa="settings-mobile-automation-create"
                  onClick={() => navigate(pagesMap.settingsAutomationNew)}
                >
                  {t("automation.create")}
                </Button>
              )}
            </S.ListIntroRow>

            <S.ListTabs>
              <Tabs
                activeKey={activeTabKey}
                items={tabs}
                onChange={(key) => setActiveTabKey(key as AutomationListTabKey)}
                data-qa="settings-mobile-automation-tabs"
              />
            </S.ListTabs>
          </S.ListContentRoot>
        </MobileS.ContentSection>
      </MobileS.ScrollRegion>
    </MobileS.Root>
  );
});
