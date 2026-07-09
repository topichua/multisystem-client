import {
  ORDER_STATUS_CATEGORIES,
  type OrderStatus,
  type OrderStatusCategory,
} from "@/features/orders/model/order.types";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";

export type OrderStatusCategoryGroup = {
  category: OrderStatusCategory;
  color: string;
  statuses: OrderStatus[];
};

const compareStatusesInCategory = (
  left: OrderStatus,
  right: OrderStatus,
): number => {
  if (left.isSystem !== right.isSystem) {
    return left.isSystem ? -1 : 1;
  }

  return left.sortOrder - right.sortOrder;
};

export const getOrderStatusCategoryColor = (
  statuses: OrderStatus[],
  category: OrderStatusCategory,
): string => {
  const systemStatus = statuses.find(
    (status) => status.category === category && status.isSystem,
  );

  if (systemStatus) {
    return systemStatus.color;
  }

  const firstInCategory = statuses.find(
    (status) => status.category === category,
  );

  return firstInCategory?.color ?? DEFAULT_COLOR_PRESET;
};

export const groupOrderStatusesByCategory = (
  statuses: OrderStatus[],
): OrderStatusCategoryGroup[] =>
  ORDER_STATUS_CATEGORIES.map((category) => ({
    category,
    color: getOrderStatusCategoryColor(statuses, category),
    statuses: statuses
      .filter((status) => status.category === category)
      .sort(compareStatusesInCategory),
  }));

export const getOrderStatusCategoryLabelKey = (
  category: OrderStatusCategory,
): `orderStatuses.categories.${OrderStatusCategory}` =>
  `orderStatuses.categories.${category}`;
