import type {
  ProductVariant,
  ProductVariantCreatePayload,
  ProductVariantDraft,
  ProductVariantUpdatePayload,
} from "@/features/products/model/product.types";

import { defaultVariantFormValues } from "./variant-form.types";

const PERSISTED_VARIANT_ROW_KEY_PREFIX = "variant-";

export const variantRowKey = (variantId: number): string =>
  `${PERSISTED_VARIANT_ROW_KEY_PREFIX}${variantId}`;

export const parseVariantRowKey = (clientId: string): number | null => {
  if (!clientId.startsWith(PERSISTED_VARIANT_ROW_KEY_PREFIX)) {
    return null;
  }

  const variantId = Number(
    clientId.slice(PERSISTED_VARIANT_ROW_KEY_PREFIX.length),
  );
  return Number.isFinite(variantId) ? variantId : null;
};

export const variantToDraft = (
  variant: ProductVariant,
): ProductVariantDraft => ({
  clientId: variantRowKey(variant.id),
  color: variant.color ?? "",
  size: variant.size ?? "",
  price: variant.price ?? 0,
  quantity: variant.quantity ?? 0,
  inStock: variant.inStock ?? false,
  sku: variant.sku ?? "",
  imageUrl: variant.imageUrl ?? "",
  imageFile: null,
});

export const draftToCreatePayload = (
  draft: ProductVariantDraft,
): ProductVariantCreatePayload => ({
  color: draft.color,
  size: draft.size,
  price: draft.price,
  inStock: draft.inStock,
  quantity: draft.quantity,
  sku: draft.sku ?? "",
  imageUrl: draft.imageFile ? "" : (draft.imageUrl ?? "").trim(),
});

export const draftToUpdatePayload = (
  draft: ProductVariantDraft,
): ProductVariantUpdatePayload => ({
  color: draft.color,
  size: draft.size,
  price: draft.price,
  inStock: draft.inStock,
  quantity: draft.quantity,
  sku: draft.sku ?? "",
  imageUrl: draft.imageFile ? "" : (draft.imageUrl ?? "").trim(),
});

export const createVariantDraftClientId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createEmptyVariantDraft = (
  clientId: string,
): ProductVariantDraft => ({
  clientId,
  color: "",
  size: "",
  price: defaultVariantFormValues.price,
  quantity: defaultVariantFormValues.quantity,
  inStock: defaultVariantFormValues.inStock,
  sku: "",
  imageUrl: "",
  imageFile: null,
});

export const isVariantDraftValid = (draft: ProductVariantDraft): boolean =>
  draft.color.trim().length > 0 &&
  draft.size.trim().length > 0 &&
  draft.price >= 0 &&
  draft.quantity >= 0;
