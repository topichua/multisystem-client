export const MIN_PRODUCT_SEARCH_LENGTH = 3;
export const PRODUCT_SEARCH_DEBOUNCE_MS = 300;
export const SUMMARY_DELIVERY_AMOUNT = 100;
export const SUMMARY_CURRENCY = "₴";

export const drawerKey = (suffix: string) =>
  `conversation.clientOrders.drawer.${suffix}` as const;
