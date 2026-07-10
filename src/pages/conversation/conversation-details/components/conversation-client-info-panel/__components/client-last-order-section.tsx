import { Button, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientDetailsPath, getOrderDetailsPath } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { Tag } from "@/components/tag/tag";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { formatDate } from "@/utils/date-time";

import * as S from "../conversation-client-info-panel.styled";

const { Text } = Typography;

type ClientLastOrderSectionProps = {
  clientId: number;
};

function formatMoney(amount: number, currency: string): string {
  const suffix = currency === "UAH" ? "₴" : currency;
  return `${amount.toLocaleString("uk-UA")} ${suffix}`;
}

export const ClientLastOrderSection = observer(function ClientLastOrderSection({
  clientId,
}: ClientLastOrderSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ordersStore = useOrdersStore();

  useEffect(() => {
    void ordersStore.loadClientOrders(clientId);

    return () => {
      ordersStore.clearClientOrders();
    };
  }, [clientId, ordersStore]);

  const lastOrder = ordersStore.clientOrders[0] ?? null;

  return (
    <S.Section>
      <Flex align="center" justify="space-between" gap={8}>
        <S.SectionLabel>
          {t("conversation.clientOrders.lastOrderSection")}
        </S.SectionLabel>
        <Button
          type="link"
          size="small"
          style={{ padding: 0, height: "auto" }}
          onClick={() => navigate(getClientDetailsPath(clientId))}
        >
          {t("conversation.clientOrders.allOrders")}
        </Button>
      </Flex>

      {ordersStore.clientOrdersLoading ? (
        <CenteredSpinner minHeight={96} />
      ) : ordersStore.clientOrdersError ? (
        <Text type="danger">{ordersStore.clientOrdersError}</Text>
      ) : lastOrder ? (
        <S.LastOrderCard
          role="button"
          tabIndex={0}
          onClick={() => navigate(getOrderDetailsPath(lastOrder.id))}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigate(getOrderDetailsPath(lastOrder.id));
            }
          }}
        >
          <Flex align="center" justify="space-between" gap={8}>
            <Flex align="center" gap={8} style={{ minWidth: 0 }}>
              <Text strong>
                {t("conversation.clientOrders.orderNumber", {
                  id: lastOrder.id,
                })}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatDate(lastOrder.createdAt)}
              </Text>
            </Flex>
            <Tag color={lastOrder.status.color}>{lastOrder.status.name}</Tag>
          </Flex>

          <Flex align="center" justify="space-between">
            <Text type="secondary">
              {t("conversation.clientOrders.totalLabel")}
            </Text>
            <Text strong>
              {formatMoney(lastOrder.totalAmount, lastOrder.currency)}
            </Text>
          </Flex>
        </S.LastOrderCard>
      ) : (
        <Text type="secondary">{t("conversation.clientOrders.emptyOrders")}</Text>
      )}
    </S.Section>
  );
});
