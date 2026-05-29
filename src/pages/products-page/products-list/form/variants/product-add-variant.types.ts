import type { ProductStatus } from "@/features/products/model/product.types";

export type UploadedProductMedia = {
  id: number;
  src: string;
};

export type VariantMediaOrigin = "product" | "variant";

export type VariantMediaItem = {
  id: number;
  src: string;
  origin: VariantMediaOrigin;
};

export type ProductVariantUiCustomField = {
  fieldId: number;
  fieldKey: string;
  fieldLabel: string;
  value: string;
};

export type ProductVariantSource = "generated" | "manual";

export type ProductVariantUi = {
  key: string;
  source: ProductVariantSource;
  customFields: ProductVariantUiCustomField[];
  status: ProductStatus;
  price: number;
  inStock: boolean;
  quantity: number;
  sku?: string;
  media: VariantMediaItem[];
};

export type ProductAddVariantFormValues = {
  key: string;
  price: number;
  quantity: number;
  sku: string;
  discountPrice?: number;
};
