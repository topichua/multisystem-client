import { Card, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { formatDate } from "@/utils/date-time";

const { Text } = Typography;

function formatUahAmount(amount: number): string {
  return `${amount.toLocaleString("uk-UA")} ₴`;
}

type ClientOrdersSummaryProps = {
  clientId: number;
};

export const ClientOrdersSummary = observer(
  ({ clientId }: ClientOrdersSummaryProps) => {
    const { t } = useTranslation();
    const ordersStore = useOrdersStore();

    useEffect(() => {
      void ordersStore.loadClientStats(clientId);

      return () => {
        ordersStore.clearClientStats();
      };
    }, [clientId, ordersStore]);

    const stats = useMemo(() => {
      const data = ordersStore.clientStats;
      const emptyValue = "—";

      return [
        {
          key: "ordersCount",
          label: t("conversation.clientOrders.ordersCount"),
          value: data ? String(data.orderCount) : emptyValue,
        },
        {
          key: "lastOrder",
          label: t("conversation.clientOrders.lastOrder"),
          value: data?.lastOrderAt ? formatDate(data.lastOrderAt) : emptyValue,
        },
        {
          key: "spent",
          label: t("conversation.clientOrders.spent"),
          value: data ? formatUahAmount(data.totalSpent) : emptyValue,
        },
        {
          key: "averageBill",
          label: t("conversation.clientOrders.averageBill"),
          value: data ? formatUahAmount(data.averageOrderPrice) : emptyValue,
        },
      ];
    }, [ordersStore.clientStats, t]);

    if (ordersStore.clientStatsLoading) {
      return (
        <Flex vertical gap={4}>
          <Text strong>{t("conversation.clientOrders.summaryTitle")}</Text>
          <CenteredSpinner minHeight={96} />
        </Flex>
      );
    }

    return (
      <Flex vertical gap={4}>
        <Text strong>{t("conversation.clientOrders.summaryTitle")}</Text>
        {ordersStore.clientStatsError ? (
          <Text type="danger">{ordersStore.clientStatsError}</Text>
        ) : null}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            width: 330,
          }}
        >
          {stats.map(({ key, label, value }) => (
            <Card
              key={key}
              size="small"
              variant="outlined"
              style={{
                background: "transparent",
                borderRadius: 10,
              }}
              styles={{
                body: {
                  padding: "8px 10px",
                },
                root: {
                  boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                },
              }}
            >
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}
                ellipsis
              >
                {label}
              </Text>

              <Text
                strong
                style={{
                  display: "block",
                  fontSize: 15,
                  lineHeight: 1.3,
                }}
                ellipsis
              >
                {value}
              </Text>
            </Card>
          ))}
        </div>
      </Flex>
    );
  },
);
