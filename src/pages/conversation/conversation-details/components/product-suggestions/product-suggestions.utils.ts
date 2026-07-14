import type {
  ConversationProductSuggestionMedia,
  ConversationProductSuggestionProduct,
  ConversationProductSuggestionVariant,
} from "@/features/conversations/model/types";
import type {
  CatalogVariant,
  Product,
  ProductMediaItem,
  ProductVariant,
} from "@/features/products/model/product.types";
import {
  getVariantDescriptor,
  productVariantToCatalogVariant,
} from "@/features/products/utils/catalog-variant-display";

const suggestionMediaToProductMedia = (
  media: ConversationProductSuggestionMedia,
): ProductMediaItem => ({
  id: media.id,
  uploadMediaId: media.uploadMediaId,
  productId: media.productId,
  variantId: media.variantId,
  url: media.url,
  type: media.type,
  sourceUrl: media.sourceUrl,
  sortOrder: media.sortOrder,
});

export const suggestionVariantToProductVariant = (
  variant: ConversationProductSuggestionVariant,
): ProductVariant => {
  const imageUrl =
    variant.imageUrl || variant.media.find((media) => media.url)?.url || null;

  return {
    id: variant.id,
    customFields: variant.customFields,
    price: variant.price,
    inStock: variant.inStock && variant.availableQuantity > 0,
    quantity: variant.availableQuantity,
    reservedQuantity: variant.reservedQuantity,
    availableQuantity: variant.availableQuantity,
    wishlistCount: variant.wishlistCount,
    imageUrl,
    sku: variant.sku,
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
    status: variant.status,
    media: variant.media.map(suggestionMediaToProductMedia),
  };
};

export const suggestionProductToProduct = (
  product: ConversationProductSuggestionProduct,
): Product => ({
  id: product.id,
  name: product.name,
  productType: product.productType,
  status: product.status,
  price: product.price,
  currency: product.currency,
  inStock: product.inStock,
  quantity: product.quantity,
  wishlistCount: product.wishlistCount,
  mainImageUrl: product.mainImageUrl,
  categoryId: product.categoryId,
  weightGrams: product.weightGrams,
  lengthCm: product.lengthCm,
  widthCm: product.widthCm,
  heightCm: product.heightCm,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  variants: product.variants.map(suggestionVariantToProductVariant),
});

export const getSuggestionVariantTitle = (
  variant: ConversationProductSuggestionVariant,
): string => {
  const descriptor = getVariantDescriptor(
    suggestionVariantToProductVariant(variant),
  );

  return descriptor || `#${variant.id}`;
};

export const getSuggestionProductImageUrl = (
  product: ConversationProductSuggestionProduct,
): string | undefined =>
  product.mainImageUrl ||
  product.variants.find((variant) => variant.imageUrl)?.imageUrl ||
  product.variants
    .flatMap((variant) => variant.media)
    .find((media) => media.url)?.url ||
  undefined;

export const getSuggestionProductAvailableQuantity = (
  product: ConversationProductSuggestionProduct,
): number =>
  product.variants.length > 0
    ? product.variants.reduce(
        (total, variant) => total + variant.availableQuantity,
        0,
      )
    : product.quantity;

export const productSuggestionVariantToCatalogVariant = (
  product: ConversationProductSuggestionProduct,
  variant: ConversationProductSuggestionVariant,
): CatalogVariant =>
  productVariantToCatalogVariant(
    suggestionProductToProduct(product),
    suggestionVariantToProductVariant(variant),
  );
