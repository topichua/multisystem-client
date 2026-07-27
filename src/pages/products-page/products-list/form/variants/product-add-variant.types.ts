import type { ProductStatus } from "@/features/products/model/product.types";
import type { CreateProductCustomFieldType } from "@/features/products/model/product-create-api.types";

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

export type ExistingCharacteristicFieldRef = {
  kind: "existing";
  id: number;
};

export type NewCharacteristicFieldRef = {
  kind: "new";
  clientKey: string;
  name: string;
  type: CreateProductCustomFieldType;
};

export type CharacteristicFieldRef =
  | ExistingCharacteristicFieldRef
  | NewCharacteristicFieldRef;

export type ProductCharacteristicFormRow = {
  field?: CharacteristicFieldRef;
  values?: string[];
  value?: string;
};

export type SingleProductCharacteristicFormRow = {
  field?: CharacteristicFieldRef;
  value?: string;
};

export type ProductVariantUiCustomField = {
  /** Legacy id used by the current UI until characteristic rows move to `field`. */
  fieldId: number;
  field?: CharacteristicFieldRef;
  fieldKey: string;
  fieldLabel: string;
  fieldType?: CreateProductCustomFieldType;
  value: string;
  order?: number;
};

export type ProductVariantSource = "generated" | "manual";

export type ProductVariantUi = {
  id?: number;
  key: string;
  source: ProductVariantSource;
  customFields: ProductVariantUiCustomField[];
  status: ProductStatus;
  price: number;
  inStock: boolean;
  quantity: number;
  wishlistCount?: number;
  sku?: string;
  media: VariantMediaItem[];
};

export type ProductAddVariantFormValues = {
  key: string;
  price: number;
  quantity: number;
  sku: string;
};
