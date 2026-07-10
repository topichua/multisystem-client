import { Card, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";

import * as S from "../conversation-client-info-panel.styled";

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
          key: "spent",
          label: t("conversation.clientOrders.ordersSum"),
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
        <S.Section>
          <CenteredSpinner minHeight={96} />
        </S.Section>
      );
    }

    return (
      <S.Section>
        {ordersStore.clientStatsError ? (
          <Text type="danger">{ordersStore.clientStatsError}</Text>
        ) : null}
        <S.StatsGrid>
          {stats.map(({ key, label, value }) => (
            <Card
              key={key}
              size="small"
              variant="outlined"
              styles={{
                body: {
                  padding: "10px 12px",
                },
              }}
            >
              <S.StatLabel>{label}</S.StatLabel>
              <Text strong style={{ fontSize: 18, lineHeight: 1.2 }}>
                {value}
              </Text>
            </Card>
          ))}
        </S.StatsGrid>
      </S.Section>
    );
  },
);
