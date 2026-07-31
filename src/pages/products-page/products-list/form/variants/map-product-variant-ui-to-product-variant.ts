import type { ProductVariant } from "@/features/products/model/product.types";

import type { ProductVariantUi } from "./product-add-variant.types";

export function mapProductVariantUiToProductVariant(
  variant: ProductVariantUi,
): ProductVariant | null {
  if (variant.id == null) {
    return null;
  }

  return {
    id: variant.id,
    customFields: variant.customFields.map((field, index) => ({
      fieldId: field.fieldId,
      key: field.fieldKey,
      label: field.fieldLabel,
      type: field.fieldType ?? "text",
      value: field.value,
      order: field.order ?? index,
    })),
    price: variant.price,
    inStock: variant.inStock,
    quantity: variant.quantity,
    reservedQuantity: 0,
    availableQuantity: variant.quantity,
    wishlistCount: variant.wishlistCount ?? 0,
    imageUrl: variant.media[0]?.src ?? null,
    sku: variant.sku?.trim() || null,
    createdAt: "",
    updatedAt: "",
    status: variant.status,
    media: [],
  };
}
