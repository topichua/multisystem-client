export const PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS =
  "product-variant-scroll-highlight";

export const PRODUCT_VARIANT_ANCHOR_ATTR = "data-product-variant-id" as const;

/** Keep in sync with CSS animation duration below. */
export const PRODUCT_VARIANT_SCROLL_HIGHLIGHT_MS = 2000;

export const PRODUCT_VARIANT_SCROLL_HIGHLIGHT_DURATION = `${
  PRODUCT_VARIANT_SCROLL_HIGHLIGHT_MS / 1000
}s`;
