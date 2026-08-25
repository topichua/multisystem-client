import { Alert, Card, Empty, Flex, Switch, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type {
  AutomationCriteria,
  AutomationRule,
} from "@/features/automation/model/automation.types";
import { formatAutomationRuleSummary } from "@/features/automation/model/format-automation-rule-summary";

const { Text } = Typography;

type AutomationRulesListProps = {
  rules: AutomationRule[];
  criteria: AutomationCriteria | null;
  listError: string | null;
  listLoading: boolean;
  activeToggleLoadingId: number | null;
  onToggleActive: (ruleId: number, isActive: boolean) => void;
  onOpenRule: (ruleId: number) => void;
  itemQa: (ruleId: number) => string;
  activeQa?: (ruleId: number) => string;
  showActiveLabel?: boolean;
  emptyMarginTop?: number;
};

export const AutomationRulesList = observer(
  ({
    rules,
    criteria,
    listError,
    listLoading,
    activeToggleLoadingId,
    onToggleActive,
    onOpenRule,
    itemQa,
    activeQa,
    showActiveLabel = false,
    emptyMarginTop,
  }: AutomationRulesListProps) => {
    const { t } = useTranslation();

    return (
      <>
        {listError && <Alert type="error" title={listError} showIcon />}
        {listLoading && rules.length === 0 ? (
          <CenteredSpinner />
        ) : rules.length === 0 ? (
          <Empty
            description={t("automation.empty")}
            style={
              emptyMarginTop != null ? { marginTop: emptyMarginTop } : undefined
            }
          />
        ) : (
          <Flex vertical gap={16}>
            {rules.map((rule) => (
              <Card
                key={rule.id}
                size="small"
                hoverable
                onClick={() => onOpenRule(rule.id)}
                data-qa={itemQa(rule.id)}
              >
                <Flex vertical gap={8}>
                  <Flex align="flex-start" justify="space-between" gap={12}>
                    <Text strong style={{ minWidth: 0, fontSize: 16 }}>
                      {rule.name}
                    </Text>
                    <div
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <Flex align="center" gap={8}>
                        <Switch
                          checked={rule.isActive}
                          loading={activeToggleLoadingId === rule.id}
                          onChange={(checked) => {
                            void onToggleActive(rule.id, checked);
                          }}
                          data-qa={activeQa?.(rule.id)}
                        />
                        {showActiveLabel && (
                          <Text
                            type={rule.isActive ? undefined : "secondary"}
                            style={{ minWidth: 70 }}
                          >
                            {rule.isActive
                              ? t("automation.active")
                              : t("automation.inactive")}
                          </Text>
                        )}
                      </Flex>
                    </div>
                  </Flex>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatAutomationRuleSummary(rule, criteria, t)}
                  </Text>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </>
    );
  },
);
