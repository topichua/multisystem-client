import { PlusIcon } from "@phosphor-icons/react";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import type { ClientLastOrder } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";

import * as S from "./composer-toolbar.styled";

export type ComposerTab = "messages" | "note";

type ComposerToolbarProps = {
  activeTab: ComposerTab;
  hasLinkedClient: boolean;
  clientLookupLoading: boolean;
  clientLastOrder: ClientLastOrder | null;
  clientLastOrderLoading: boolean;
  onCreateOrderClick: () => void;
  onLastOrderOpen: (orderId: number) => void;
  onTabChange: (tab: ComposerTab) => void;
};

export function ComposerToolbar({
  activeTab,
  hasLinkedClient,
  clientLookupLoading,
  clientLastOrder,
  clientLastOrderLoading,
  onCreateOrderClick,
  onLastOrderOpen,
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

  const lastOrderButton = clientLastOrder ? (
    <S.LastOrderButton
      type="button"
      aria-label={t("conversation.clientOrders.openCurrentOrderAria", {
        id: clientLastOrder.id,
      })}
      data-qa="layout-conversation-details-composer-last-order"
      onClick={() => onLastOrderOpen(clientLastOrder.id)}
    >
      <S.LastOrderLabel>
        {t("conversation.clientOrders.currentOrder")}
      </S.LastOrderLabel>
      <S.LastOrderNumber>#{clientLastOrder.id}</S.LastOrderNumber>
      {clientLastOrder.status.name && (
        <S.LastOrderStatus>
          <S.LastOrderStatusDot $statusColor={clientLastOrder.status.color} />
          <S.LastOrderStatusName>
            {clientLastOrder.status.name}
          </S.LastOrderStatusName>
        </S.LastOrderStatus>
      )}
      <S.LastOrderTotal>
        {formatMoney(clientLastOrder.totalPrice, "UAH")}
      </S.LastOrderTotal>
    </S.LastOrderButton>
  ) : clientLastOrderLoading && hasLinkedClient ? (
    <S.LastOrderSkeleton
      aria-hidden="true"
      data-qa="layout-conversation-details-composer-last-order-loading"
    />
  ) : null;

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

      <S.Actions>
        {lastOrderButton}

        {createOrderTooltip ? (
          <Tooltip title={createOrderTooltip}>
            <span style={{ display: "inline-flex", flexShrink: 0 }}>
              {createOrderButton}
            </span>
          </Tooltip>
        ) : (
          createOrderButton
        )}
      </S.Actions>
    </S.Toolbar>
  );
}
