import type { OrderStatus } from '@/features/orders/model/order.types';

export type OrderStatusSelectOptionData = {
  value: number;
  label: string;
  color: string;
};

export const toOrderStatusSelectOptions = (
  statuses: OrderStatus[],
): OrderStatusSelectOptionData[] =>
  [...statuses]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((status) => ({
      value: status.id,
      label: status.name,
      color: status.color,
    }));
