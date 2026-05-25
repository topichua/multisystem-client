import { Empty, Spin } from 'antd';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import { getOrderStatusPath } from '@/app/router/pages-map';
import { useOrdersStore } from '@/features/orders/model/use-orders-store';

export const OrderStatusesIndex = observer(() => {
  const { t } = useTranslation();
  const store = useOrdersStore();

  if (store.statusesLoading && store.statuses.length === 0) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  const sorted = [...store.statuses].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length > 0) {
    return <Navigate to={getOrderStatusPath(sorted[0].id)} replace />;
  }

  return <Empty description={t('orderStatuses.noStatusesYet')} style={{ marginTop: 48 }} />;
});
