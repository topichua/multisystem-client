import { Button, Card, Flex, Space, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  getClientDetailsPath,
  getOrderDetailsPath,
} from '@/app/router/pages-map';
import { CenteredSpinner } from '@/components/loading/centered-spinner';
import { Tag } from '@/components/tag/tag';
import { useOrdersStore } from '@/features/orders/model/use-orders-store';
import { formatDate } from '@/utils/date-time';

import * as S from '../conversation-client-info-panel.styled';

const { Text } = Typography;

type ClientLastOrderSectionProps = {
  clientId: number;
};

function formatMoney(amount: number, currency: string): string {
  const suffix = currency === 'UAH' ? '₴' : currency;
  return `${amount.toLocaleString('uk-UA')} ${suffix}`;
}

export const ClientLastOrderSection = observer(
  ({ clientId }: ClientLastOrderSectionProps) => {
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

    const handleOpenOrder = () => {
      if (!lastOrder) {
        return;
      }

      navigate(getOrderDetailsPath(lastOrder.id));
    };

    return (
      <S.Section style={{ gap: 8 }}>
        <Flex align="center" justify="space-between" gap={8}>
          <S.SectionLabel>
            {t('conversation.clientOrders.lastOrderSection')}
          </S.SectionLabel>
          <Button
            type="link"
            size="small"
            style={{ padding: 0, height: 'auto', fontSize: 13 }}
            onClick={() => navigate(getClientDetailsPath(clientId))}
          >
            {t('conversation.clientOrders.allOrders')}
          </Button>
        </Flex>

        {ordersStore.clientOrdersLoading ? (
          <CenteredSpinner minHeight={64} />
        ) : ordersStore.clientOrdersError ? (
          <Text type="danger">{ordersStore.clientOrdersError}</Text>
        ) : lastOrder ? (
          <Card
            size="small"
            onClick={handleOpenOrder}
            styles={{ body: { padding: 10 } }}
          >
            <Space orientation="vertical" size={6} style={{ width: '100%' }}>
              <Flex align="center" justify="space-between" gap={8}>
                <Text strong>#{lastOrder.id}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(lastOrder.createdAt)}
                </Text>
              </Flex>

              <Flex align="center" justify="space-between" gap={8}>
                <Tag color={lastOrder.status.color}>
                  {lastOrder.status.name}
                </Tag>
                <Text strong>
                  {formatMoney(lastOrder.totalAmount, lastOrder.currency)}
                </Text>
              </Flex>
            </Space>
          </Card>
        ) : (
          <Text type="secondary">
            {t('conversation.clientOrders.emptyOrders')}
          </Text>
        )}
      </S.Section>
    );
  },
);
