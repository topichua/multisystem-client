import { PlusIcon } from "@phosphor-icons/react";
import { Button, Tabs, Typography } from "antd";
import type { TabsProps } from "antd";
import { observer } from "mobx-react-lite";

import { AutomationChannelSettings } from "./automation-channel-settings";
import { AutomationRulesList } from "./automation-rules-list";
import * as S from "./settings-automation.styled";
import {
  useAutomationList,
  type AutomationListTabKey,
} from "./use-automation-list";

const { Paragraph } = Typography;

export type AutomationListQa = {
  create: string;
  tabs: string;
  item: (ruleId: number) => string;
  itemActive?: (ruleId: number) => string;
};

type AutomationListContentProps = {
  qa: AutomationListQa;
  createButtonBlock?: boolean;
  showActiveLabel?: boolean;
  emptyMarginTop?: number;
};

export const AutomationListContent = observer(
  ({
    qa,
    createButtonBlock = false,
    showActiveLabel = false,
    emptyMarginTop,
  }: AutomationListContentProps) => {
    const {
      t,
      store,
      activeTabKey,
      setActiveTabKey,
      description,
      handleToggleActive,
      navigateToCreate,
      navigateToRule,
    } = useAutomationList();

    const tabs: TabsProps["items"] = [
      {
        key: "rules",
        label: t("automation.tabs.rules"),
        children: (
          <AutomationRulesList
            rules={store.rules}
            criteria={store.criteria}
            listError={store.listError}
            listLoading={store.listLoading}
            activeToggleLoadingId={store.activeToggleLoadingId}
            onToggleActive={handleToggleActive}
            onOpenRule={navigateToRule}
            itemQa={qa.item}
            activeQa={qa.itemActive}
            showActiveLabel={showActiveLabel}
            emptyMarginTop={emptyMarginTop}
          />
        ),
      },
      {
        key: "settings",
        label: t("automation.tabs.settings"),
        children: <AutomationChannelSettings />,
      },
    ];

    return (
      <S.ListContentRoot>
        <S.ListIntroRow>
          <Paragraph
            type="secondary"
            style={{ margin: 0, maxWidth: 680, minHeight: 42 }}
          >
            {description}
          </Paragraph>
          {activeTabKey === "rules" && (
            <Button
              type="primary"
              block={createButtonBlock}
              icon={<PlusIcon />}
              data-qa={qa.create}
              onClick={navigateToCreate}
            >
              {t("automation.create")}
            </Button>
          )}
        </S.ListIntroRow>

        <Tabs
          activeKey={activeTabKey}
          items={tabs}
          onChange={(key) => setActiveTabKey(key as AutomationListTabKey)}
          data-qa={qa.tabs}
          style={{ marginTop: 24, minWidth: 0 }}
        />
      </S.ListContentRoot>
    );
  },
);
