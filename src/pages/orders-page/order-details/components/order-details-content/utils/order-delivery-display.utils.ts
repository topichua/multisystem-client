import {
  EMPTY_VALUE,
  formatText,
  getVariantLabel,
} from "../../../utils/order-details.utils";

import type {
  DeliveryInfo,
  OrderItem,
  TranslationFn,
} from "../order-details-content.types";

export const formatDeliveryAddress = (deliveryInfo: DeliveryInfo): string => {
  const parts = [
    deliveryInfo?.street,
    deliveryInfo?.building,
    deliveryInfo?.flat,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return parts.join(", ");
};

export const getDiscountDisplayValue = (discountAmount: number): number =>
  discountAmount > 0 ? -discountAmount : discountAmount;

export const getProductMeta = (item: OrderItem): string => {
  const variantLabel = getVariantLabel(item);
  const parts: string[] = [];

  if (variantLabel !== EMPTY_VALUE) {
    parts.push(variantLabel);
  }

  if (item.skuSnapshot) {
    parts.push(item.skuSnapshot);
  }

  return parts.join(" / ") || EMPTY_VALUE;
};

export const getDeliveryTypeLabel = (
  deliveryInfo: DeliveryInfo,
  t: TranslationFn,
): string => {
  if (deliveryInfo?.deliveryType === "warehouse" || deliveryInfo?.warehouse) {
    return t("orders.details.deliveryBranchType");
  }

  if (deliveryInfo?.deliveryType === "address" || deliveryInfo?.street) {
    return t("orders.address");
  }

  return EMPTY_VALUE;
};

export const getDeliveryDestination = (deliveryInfo: DeliveryInfo): string =>
  formatText(deliveryInfo?.warehouse || formatDeliveryAddress(deliveryInfo));
