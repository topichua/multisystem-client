import { PlusIcon } from "@phosphor-icons/react";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "./composer-toolbar.styled";

export type ComposerTab = "messages" | "note";

type ComposerToolbarProps = {
  activeTab: ComposerTab;
  hasLinkedClient: boolean;
  clientLookupLoading: boolean;
  onCreateOrderClick: () => void;
  onTabChange: (tab: ComposerTab) => void;
};

export function ComposerToolbar({
  activeTab,
  hasLinkedClient,
  clientLookupLoading,
  onCreateOrderClick,
  onTabChange,
}: ComposerToolbarProps) {
  const { t } = useTranslation();

  const createOrderDisabled = clientLookupLoading || !hasLinkedClient;
  const createOrderTooltip =
    !clientLookupLoading && !hasLinkedClient
      ? t("composer.createOrderDisabledTooltip")
      : undefined;

  const createOrderButton = (
    <Button
      color="primary"
      variant="filled"
      icon={<PlusIcon size={16} />}
      disabled={createOrderDisabled}
      data-qa="layout-conversation-details-composer-create-order"
      onClick={onCreateOrderClick}
    >
      {t("conversation.clientOrders.createOrder")}
    </Button>
  );

  return (
    <S.Toolbar>
      <S.Tabs role="tablist" aria-label={t("composer.tabsAria")}>
        <S.Tab
          type="button"
          role="tab"
          aria-selected={activeTab === "messages"}
          $active={activeTab === "messages"}
          onClick={() => onTabChange("messages")}
          data-qa="layout-conversation-details-composer-tab-messages"
        >
          {t("composer.tabs.messages")}
        </S.Tab>
        <S.Tab
          type="button"
          role="tab"
          aria-selected={activeTab === "note"}
          $active={activeTab === "note"}
          onClick={() => onTabChange("note")}
          data-qa="layout-conversation-details-composer-tab-note"
        >
          {t("composer.tabs.note")}
        </S.Tab>
      </S.Tabs>

      {createOrderTooltip ? (
        <Tooltip title={createOrderTooltip}>
          <span style={{ display: "inline-flex", flexShrink: 0 }}>
            {createOrderButton}
          </span>
        </Tooltip>
      ) : (
        createOrderButton
      )}
    </S.Toolbar>
  );
}
