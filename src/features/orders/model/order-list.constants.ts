export const ORDERS_LIST_KEYWORD_MIN_LENGTH = 3;

export const ORDER_SOURCE_FILTER_VALUES = [
  "instagram",
  "telegram",
  "manual",
] as const;

export type OrderSourceFilter = (typeof ORDER_SOURCE_FILTER_VALUES)[number];

export function isOrderSourceFilter(value: string): value is OrderSourceFilter {
  return (ORDER_SOURCE_FILTER_VALUES as readonly string[]).includes(value);
}
