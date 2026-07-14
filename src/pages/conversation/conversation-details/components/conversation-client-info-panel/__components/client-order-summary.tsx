import { Card, Divider, Flex, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CenteredSpinner } from '@/components/loading/centered-spinner';
import { useOrdersStore } from '@/features/orders/model/use-orders-store';

import * as S from '../conversation-client-info-panel.styled';

const { Text } = Typography;

const statLabelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  marginBottom: 2,
};

function formatUahAmount(amount: number): string {
  return `${amount.toLocaleString('uk-UA')} ₴`;
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
      const emptyValue = '—';

      return [
        {
          key: 'ordersCount',
          label: t('conversation.clientOrders.ordersCount'),
          value: data ? String(data.orderCount) : emptyValue,
        },
        {
          key: 'spent',
          label: t('conversation.clientOrders.ordersSum'),
          value: data ? formatUahAmount(data.totalSpent) : emptyValue,
        },
        {
          key: 'averageBill',
          label: t('conversation.clientOrders.averageBill'),
          value: data ? formatUahAmount(data.averageOrderPrice) : emptyValue,
        },
      ];
    }, [ordersStore.clientStats, t]);

    if (ordersStore.clientStatsLoading) {
      return (
        <S.Section>
          <CenteredSpinner minHeight={64} />
        </S.Section>
      );
    }

    return (
      <S.Section>
        {ordersStore.clientStatsError && (
          <Text type="danger">{ordersStore.clientStatsError}</Text>
        )}
        <S.SectionLabel>
          {t('conversation.clientOrders.overviewOrderSummary')}
        </S.SectionLabel>
        <Card
          size="small"
          variant="outlined"
          styles={{ body: { padding: '8px 0' } }}
        >
          <Flex align="center">
            {stats.map((stat, index) => (
              <Flex key={stat.key} align="center" style={{ flex: 1 }}>
                {index > 0 && (
                  <Divider
                    orientation="vertical"
                    style={{ height: 28, margin: 0 }}
                  />
                )}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <Text type="secondary" style={statLabelStyle}>
                    {stat.label}
                  </Text>
                  <Text strong style={{ fontSize: 16, lineHeight: 1.2 }}>
                    {stat.value}
                  </Text>
                </div>
              </Flex>
            ))}
          </Flex>
        </Card>
      </S.Section>
    );
  },
);
