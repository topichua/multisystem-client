import { PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Empty, Flex, Switch, Tabs, Typography } from "antd";
import type { TabsProps } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsAutomationPath, pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { formatAutomationRuleSummary } from "@/features/automation/model/format-automation-rule-summary";
import { useAutomationStore } from "@/features/automation/model/use-automation-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import { AutomationChannelSettings } from "./automation-channel-settings";
import * as S from "./settings-automation.styled";

const { Title } = Typography;
type AutomationListTabKey = "rules" | "settings";

export const SettingsAutomationListView = observer(() => {
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
            <Empty
              description={t("automation.empty")}
              style={{ marginTop: 48 }}
            />
          ) : (
            <S.ListStack>
              {store.rules.map((rule) => (
                <S.ListItem
                  key={rule.id}
                  type="button"
                  onClick={() => navigate(getSettingsAutomationPath(rule.id))}
                  data-qa={`settings-automation-item-${rule.id}`}
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
                          data-qa={`settings-automation-item-active-${rule.id}`}
                        />
                        <S.ActiveLabel>{t("automation.active")}</S.ActiveLabel>
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
    <PaneDetailLayout.Root inset data-qa="layout-settings-automation">
      <PaneDetailLayout.Header data-qa="layout-settings-automation-header">
        <Title level={4} style={{ margin: 0 }}>
          {t("automation.title")}
        </Title>
      </PaneDetailLayout.Header>

      <PaneDetailLayout.Body data-qa="layout-settings-automation-body">
        <S.ListContentRoot>
          <S.ListIntroRow>
            <S.ListDescription>{description}</S.ListDescription>
            {activeTabKey === "rules" && (
              <Button
                type="primary"
                icon={<PlusIcon />}
                data-qa="settings-automation-create"
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
              data-qa="settings-automation-tabs"
            />
          </S.ListTabs>
        </S.ListContentRoot>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
