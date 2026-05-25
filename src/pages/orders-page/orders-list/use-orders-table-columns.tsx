import type { TableColumnsType } from 'antd';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { OrderStatusSelect } from '@/features/orders/components/order-status-select';
import type { OrderListItem } from '@/features/orders/model/order.types';

const { Text } = Typography;

function formatCustomerName(order: OrderListItem): string {
  return (
    [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ').trim() || '—'
  );
}

function formatMoney(amount: number, currency: string): string {
  const suffix = currency === 'UAH' ? '₴' : currency;
  return `${amount.toLocaleString('uk-UA')} ${suffix}`;
}

export function useOrdersTableColumns(): TableColumnsType<OrderListItem> {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        title: t('orders.table.id'),
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: t('orders.table.customer'),
        key: 'customer',
        render: (_, order) => <Text>{formatCustomerName(order)}</Text>,
      },
      {
        title: t('orders.table.status'),
        key: 'status',
        width: 200,
        render: (_, order) => <OrderStatusSelect orderId={order.id} statusId={order.statusId} />,
      },
      {
        title: t('orders.table.total'),
        key: 'total',
        width: 140,
        render: (_, order) => <Text strong>{formatMoney(order.totalAmount, order.currency)}</Text>,
      },
      {
        title: t('orders.table.source'),
        dataIndex: 'source',
        key: 'source',
        width: 110,
      },
      {
        title: t('orders.table.internalNote'),
        dataIndex: 'internalNote',
        key: 'internalNote',
        ellipsis: true,
        render: (value: string | null) => value || '—',
      },
      {
        title: t('orders.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        render: (value: string) => dayjs(value).format('DD.MM.YYYY HH:mm'),
      },
    ],
    [t],
  );
}
