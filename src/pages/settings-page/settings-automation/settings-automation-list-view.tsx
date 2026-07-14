import { PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Empty, Flex, Switch, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  getSettingsAutomationPath,
  pagesMap,
} from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionHint } from "@/components/layout/pane-frame";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { formatAutomationRuleSummary } from "@/features/automation/model/format-automation-rule-summary";
import { useAutomationStore } from "@/features/automation/model/use-automation-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "./settings-automation.styled";

const { Title } = Typography;

export const SettingsAutomationListView = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const store = useAutomationStore();

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

  return (
    <PaneDetailLayout.Root inset data-qa="layout-settings-automation">
      <PaneDetailLayout.Header data-qa="layout-settings-automation-header">
        <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
          <Flex vertical gap={4} style={{ minWidth: 0, flex: "1 1 280px" }}>
            <Title level={4} style={{ margin: 0 }}>
              {t("automation.title")}
            </Title>
            <PaneSectionHint style={{ marginTop: 0 }}>
              {t("automation.sectionHint")}
            </PaneSectionHint>
          </Flex>
          <Button
            type="primary"
            icon={<PlusIcon />}
            data-qa="settings-automation-create"
            onClick={() => navigate(pagesMap.settingsAutomationNew)}
          >
            {t("automation.create")}
          </Button>
        </Flex>
      </PaneDetailLayout.Header>

      <PaneDetailLayout.Body data-qa="layout-settings-automation-body">
        {store.listError ? (
          <Alert type="error" title={store.listError} showIcon />
        ) : null}

        {store.listLoading && store.rules.length === 0 ? (
          <CenteredSpinner />
        ) : store.rules.length === 0 ? (
          <Empty description={t("automation.empty")} style={{ marginTop: 48 }} />
        ) : (
          <>
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
          </>
        )}
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
