import type {
  OrderCreateItemPayload,
  OrderDetails,
} from "@/features/orders/model/order.types";
import { normalizeOrderDiscountPercent } from "@/features/orders/utils/order-discount";
import type { CatalogVariant } from "@/features/products/model/product.types";
import {
  getCatalogVariantMeta,
  getCatalogVariantUnitPrice,
} from "@/features/products/utils/catalog-variant-display";

import {
  EMPTY_VALUE,
  formatText,
  getVariantLabel,
} from "../../../utils/order-details.utils";

import type {
  DiscountType,
  EditableOrderLine,
  OrderEditFormValues,
} from "../order-edit-modal.types";

export const normalizeTextField = (value: string | null | undefined): string =>
  value?.trim() ?? "";

export const normalizePositiveInteger = (value: unknown): number => {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 1;
  }

  return Math.max(1, Math.trunc(numericValue));
};

export const normalizeNonNegativeNumber = (value: unknown): number => {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, numericValue);
};

export const normalizeDiscountPercent = (value: unknown): number => {
  const numericValue = typeof value === "number" ? value : Number(value);

  return normalizeOrderDiscountPercent(numericValue);
};

export const getDiscountType = (
  discountAmount: unknown,
  discountPercent: unknown,
): DiscountType | null => {
  if (normalizeDiscountPercent(discountPercent) > 0) {
    return "percent";
  }

  if (normalizeNonNegativeNumber(discountAmount) > 0) {
    return "amount";
  }

  return null;
};

export const buildOrderEditInitialFormValues = (
  order: OrderDetails,
): OrderEditFormValues => {
  const orderDiscountPercent = normalizeDiscountPercent(order.discountPercent);

  return {
    customerNote: order.customerNote ?? "",
    internalNote: order.internalNote ?? "",
    discountAmount: orderDiscountPercent > 0 ? 0 : (order.discountAmount ?? 0),
    discountPercent: orderDiscountPercent,
  };
};

export const assignExclusiveDiscount = (
  target: { discountAmount?: number; discountPercent?: number },
  discountAmount: unknown,
  discountPercent: unknown,
  emptyDiscountType?: DiscountType | null,
): void => {
  const normalizedPercent = normalizeDiscountPercent(discountPercent);
  const normalizedAmount = normalizeNonNegativeNumber(discountAmount);

  if (normalizedPercent > 0) {
    target.discountPercent = normalizedPercent;
    return;
  }

  if (normalizedAmount > 0) {
    target.discountAmount = normalizedAmount;
    return;
  }

  if (emptyDiscountType === "percent") {
    target.discountPercent = 0;
  } else if (emptyDiscountType === "amount") {
    target.discountAmount = 0;
  }
};

const pickRecordNumber = (
  record: Record<string, unknown>,
  keys: string[],
): number | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
};

const getOrderItemDiscountAmount = (
  item: OrderDetails["items"][number],
): number => {
  const record = item as unknown as Record<string, unknown>;

  return normalizeNonNegativeNumber(
    pickRecordNumber(record, ["discountAmount", "discount_amount"]),
  );
};

const getOrderItemDiscountPercent = (
  item: OrderDetails["items"][number],
): number => {
  const record = item as unknown as Record<string, unknown>;

  return normalizeDiscountPercent(
    pickRecordNumber(record, ["discountPercent", "discount_percent"]),
  );
};

export const buildLineFromOrderItem = (
  item: OrderDetails["items"][number],
): EditableOrderLine => {
  const variantLabel = getVariantLabel(item);
  const discountPercent = getOrderItemDiscountPercent(item);
  const metaParts = [
    variantLabel !== EMPTY_VALUE ? variantLabel : null,
    item.skuSnapshot,
  ].filter((part): part is string => Boolean(part));

  return {
    key: `item-${item.id}`,
    productId: item.productId,
    variantId: item.variantId,
    title: formatText(item.productTitleSnapshot),
    meta: metaParts.join(" / ") || EMPTY_VALUE,
    imageUrl: item.imageUrlSnapshot,
    quantity: normalizePositiveInteger(item.quantity),
    unitPriceAmount: normalizeNonNegativeNumber(item.unitPriceAmount),
    discountAmount: discountPercent > 0 ? 0 : getOrderItemDiscountAmount(item),
    discountPercent,
  };
};

export const buildOrderEditLines = (order: OrderDetails): EditableOrderLine[] =>
  order.items.map(buildLineFromOrderItem);

export const buildLineFromVariant = (
  variant: CatalogVariant,
): EditableOrderLine => {
  const metaParts = [getCatalogVariantMeta(variant), variant.sku].filter(
    (part): part is string => Boolean(part),
  );

  return {
    key: `variant-${variant.id}`,
    productId: variant.productId,
    variantId: variant.id,
    title: variant.product.name,
    meta: metaParts.join(" / ") || EMPTY_VALUE,
    imageUrl: variant.imageUrl ?? variant.product.mainImageUrl,
    quantity: 1,
    unitPriceAmount: getCatalogVariantUnitPrice(variant),
    discountAmount: 0,
    discountPercent: 0,
  };
};

export const isLinePatchable = (
  line: EditableOrderLine,
): line is EditableOrderLine & { productId: number; variantId: number } =>
  line.productId != null && line.variantId != null;

export const buildItemPayload = (
  line: EditableOrderLine,
): OrderCreateItemPayload => {
  const item: OrderCreateItemPayload = {
    productId: line.productId ?? 0,
    variantId: line.variantId ?? 0,
    quantity: normalizePositiveInteger(line.quantity),
  };

  assignExclusiveDiscount(item, line.discountAmount, line.discountPercent);

  return item;
};

export const getLineTotal = (line: EditableOrderLine): number => {
  const subtotal = line.unitPriceAmount * line.quantity;
  const amountDiscount = Math.min(subtotal, line.discountAmount);
  const percentBase = Math.max(0, subtotal - amountDiscount);

  return Math.max(
    0,
    percentBase * (1 - normalizeDiscountPercent(line.discountPercent) / 100),
  );
};
