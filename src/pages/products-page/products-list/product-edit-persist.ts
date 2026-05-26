import type {
  ProductDetails,
  ProductUpdatePayload,
} from "@/features/products/model/product.types";

import type { ProductEditFormValues } from "./product-modal.types";

export const buildProductUpdatePayload = (
  values: ProductEditFormValues,
): ProductUpdatePayload => ({
  name: values.name,
  description: values.description || null,
  status: values.status,
  sourceType: values.sourceType || "manual",
  sourceId: values.sourceId || null,
  referenceGroupId: values.referenceGroupId || null,
  price: values.price ?? null,
  currency: values.currency,
  inStock: values.inStock,
  quantity: values.quantity ?? null,
  categoryId: values.categoryId ?? null,
});

const productFieldValue = (
  product: ProductDetails,
  field: keyof ProductEditFormValues,
) => {
  switch (field) {
    case "name":
      return product.name;
    case "description":
      return product.description ?? "";
    case "status":
      return product.status;
    case "sourceType":
      return product.sourceType ?? "manual";
    case "sourceId":
      return product.sourceId ?? "";
    case "referenceGroupId":
      return product.referenceGroupId == null
        ? ""
        : String(product.referenceGroupId);
    case "price":
      return product.price ?? undefined;
    case "currency":
      return product.currency || "UAH";
    case "inStock":
      return product.inStock ?? false;
    case "quantity":
      return product.quantity ?? undefined;
    case "categoryId":
      return product.categoryId ?? undefined;
    default:
      return undefined;
  }
};

const formFieldValue = (
  values: ProductEditFormValues,
  field: keyof ProductEditFormValues,
) => {
  switch (field) {
    case "description":
    case "sourceId":
    case "referenceGroupId":
      return values[field] ?? "";
    case "price":
    case "quantity":
    case "categoryId":
      return values[field];
    case "sourceType":
      return values.sourceType || "manual";
    case "currency":
      return values.currency || "UAH";
    default:
      return values[field];
  }
};

export const isProductFieldUnchanged = (
  product: ProductDetails,
  field: keyof ProductEditFormValues,
  values: ProductEditFormValues,
): boolean =>
  productFieldValue(product, field) === formFieldValue(values, field);

/** Single-field PATCH body for auto-save on blur. */
export const buildProductFieldPatch = (
  field: keyof ProductEditFormValues,
  values: ProductEditFormValues,
): ProductUpdatePayload => {
  switch (field) {
    case "name":
      return { name: values.name };
    case "description":
      return { description: values.description || null };
    case "status":
      return { status: values.status as ProductUpdatePayload["status"] };
    case "sourceType":
      return { sourceType: values.sourceType || "manual" };
    case "sourceId":
      return { sourceId: values.sourceId || null };
    case "referenceGroupId":
      return { referenceGroupId: values.referenceGroupId || null };
    case "price":
      return { price: values.price ?? null };
    case "currency":
      return { currency: values.currency };
    case "inStock":
      return { inStock: values.inStock };
    case "quantity":
      return { quantity: values.quantity ?? null };
    case "categoryId":
      return { categoryId: values.categoryId ?? null };
    default:
      return {};
  }
};

export const resolveMainImageUrlForGallery = (
  product: ProductDetails,
  remainingGalleryUrls: string[],
  coverUrl: string | null | undefined,
  coverImage?: File | null,
): string | null => {
  if (coverImage) {
    return "";
  }

  const trimmedCoverUrl = coverUrl?.trim() || null;

  if (remainingGalleryUrls.length === 0) {
    return null;
  }

  return trimmedCoverUrl ?? product.mainImageUrl ?? null;
};

type GalleryPersistItem = {
  id: string;
  file?: File;
  previewUrl: string;
};

export const resolveGalleryPersistPayload = (
  items: GalleryPersistItem[],
  activeCoverId: string | null,
) => {
  const resolvedCoverId =
    items.length === 0
      ? null
      : activeCoverId != null && items.some((item) => item.id === activeCoverId)
        ? activeCoverId
        : items[0].id;
  const coverItem =
    resolvedCoverId != null
      ? items.find((item) => item.id === resolvedCoverId)
      : null;
  const coverFile = coverItem?.file ?? null;
  const coverUrl = coverItem?.previewUrl.trim() || null;
  const galleryImages = items
    .filter((item) => item.id !== resolvedCoverId && item.file != null)
    .map((item) => item.file as File);
  const remainingGalleryUrls = items
    .map((item) => item.previewUrl.trim())
    .filter(Boolean);

  return { coverFile, coverUrl, galleryImages, remainingGalleryUrls };
};
