import type { InstagramAnalyzeVariant } from "@/features/products/model/instagram-analyze.types";
import type { ProductVariantDraft } from "@/features/products/model/product-variant-draft.types";

const newClientId = (index: number): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ig-${Date.now()}-${index}`;
};

export const buildVariantDraftsFromInstagramAnalyze = (
  variants: InstagramAnalyzeVariant[],
  productPrice: number,
): ProductVariantDraft[] => {
  if (variants.length === 0) {
    return [];
  }

  return variants.map((row, index) => ({
    clientId: newClientId(index),
    color: row.color ?? "",
    size: row.size ?? "",
    price: productPrice,
    inStock: true,
    quantity: 1,
    sku: "",
    imageUrl: "",
    imageFile: null,
  }));
};
