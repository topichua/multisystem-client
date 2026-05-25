import { Button, Card, Empty, Flex, Skeleton, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useOrdersStore } from '@/features/orders/model/use-orders-store';

const { Text } = Typography;

const previewCount = 3;

function formatMoney(amount: number, currency: string): string {
  const suffix = currency === 'UAH' ? '₴' : currency;
  return `${amount.toLocaleString('uk-UA')} ${suffix}`;
}

type ClientOrdersListProps = {
  clientId: number;
};

export const ClientOrdersList = observer(({ clientId }: ClientOrdersListProps) => {
  const { t } = useTranslation();
  const ordersStore = useOrdersStore();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    void ordersStore.loadClientOrders(clientId);

    return () => {
      ordersStore.clearClientOrders();
    };
  }, [clientId, ordersStore]);

  const orders = ordersStore.clientOrders;
  const visibleOrders = showAll ? orders : orders.slice(0, previewCount);
  const hasMoreOrders = ordersStore.clientOrdersTotal > previewCount;

  if (ordersStore.clientOrdersLoading) {
    return (
      <Flex vertical gap={4}>
        <Text strong>{t('conversation.clientOrders.ordersTitle')}</Text>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={4}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
        <Text strong>{t('conversation.clientOrders.ordersTitle')}</Text>

        {hasMoreOrders && (
          <Button
            type="link"
            size="small"
            style={{ padding: 0 }}
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll
              ? t('conversation.clientOrders.showLess')
              : t('conversation.clientOrders.showMore')}
          </Button>
        )}
      </Flex>

      {ordersStore.clientOrdersError ? (
        <Text type="danger">{ordersStore.clientOrdersError}</Text>
      ) : null}

      {visibleOrders.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('conversation.clientOrders.emptyOrders')}
        />
      ) : (
        <Flex vertical gap={12}>
          {visibleOrders.map((order) => (
            <Card
              key={order.id}
              size="small"
              styles={{
                body: {
                  padding: '8px 10px',
                },
              }}
            >
              <Flex vertical gap={12}>
                <Flex align="center" justify="space-between" gap={8}>
                  <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                    <Text strong>
                      {t('conversation.clientOrders.orderNumber', { id: order.id })}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(order.createdAt).format('DD.MM.YYYY')}
                    </Text>
                  </Flex>

                  <Flex gap={4} wrap="wrap" justify="end">
                    <Tag color={order.status.color}>{order.status.name}</Tag>
                  </Flex>
                </Flex>

                <Flex align="center" justify="space-between">
                  <Text type="secondary">{t('conversation.clientOrders.totalLabel')}</Text>
                  <Text strong>{formatMoney(order.totalAmount, order.currency)}</Text>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Flex>
  );
});
