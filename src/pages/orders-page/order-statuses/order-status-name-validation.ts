import type { OrderStatus } from '@/features/orders/model/order.types';

const normalizeNameKey = (name: string): string => name.trim().toLowerCase();

export const isDuplicateOrderStatusName = (
  name: string,
  statuses: OrderStatus[],
  excludeStatusId?: number,
): boolean => {
  const key = normalizeNameKey(name);

  if (key === '') {
    return false;
  }

  return statuses.some((status) => {
    if (excludeStatusId != null && status.id === excludeStatusId) {
      return false;
    }

    return normalizeNameKey(status.name) === key;
  });
};
