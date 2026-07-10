export {
  CATALOG_SEARCH_DEBOUNCE_MS as PRODUCT_SEARCH_DEBOUNCE_MS,
  MIN_CATALOG_SEARCH_LENGTH as MIN_PRODUCT_SEARCH_LENGTH,
} from "@/features/products/components/catalog-product-search";

export const SUMMARY_DELIVERY_AMOUNT = 100;
export const SUMMARY_CURRENCY = "₴";

export const drawerKey = (suffix: string) =>
  `conversation.clientOrders.drawer.${suffix}` as const;
