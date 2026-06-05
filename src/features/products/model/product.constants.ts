import type {
  ProductCreateCurrency,
  ProductCreateSourceType,
} from "./product-create-api.types";

export const PRODUCTS_DEFAULT_PAGE_SIZE = 10;

export const PRODUCT_DEFAULT_SOURCE_TYPE =
  "manual" satisfies ProductCreateSourceType;

export const PRODUCT_DEFAULT_CURRENCY = "UAH" satisfies ProductCreateCurrency;

export const PRODUCT_DEFAULT_IN_STOCK = true;
