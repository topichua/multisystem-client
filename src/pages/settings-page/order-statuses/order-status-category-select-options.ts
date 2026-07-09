import {
  ORDER_STATUS_CATEGORIES,
  type OrderStatus,
  type OrderStatusCategory,
} from "@/features/orders/model/order.types";
import {
  getOrderStatusCategoryColor,
  getOrderStatusCategoryLabelKey,
} from "@/features/orders/utils/group-order-statuses-by-category";

export type OrderStatusCategorySelectOptionData = {
  value: OrderStatusCategory;
  label: string;
  color: string;
};

export const toOrderStatusCategorySelectOptions = (
  statuses: OrderStatus[],
  translate: (key: `orderStatuses.categories.${OrderStatusCategory}`) => string,
): OrderStatusCategorySelectOptionData[] =>
  ORDER_STATUS_CATEGORIES.map((category) => ({
    value: category,
    label: translate(getOrderStatusCategoryLabelKey(category)),
    color: getOrderStatusCategoryColor(statuses, category),
  }));
