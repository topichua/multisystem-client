export type ProductLifecycleStatus = "draft" | "active" | "archived";

export type ProductType = "single" | "variants";

export type ProductCreateSourceType = "manual";

export type ProductCreateCurrency = "UAH";

export type VariantCustomFieldType = "options" | "text";

export type CreateProductCustomFieldType = "OPTION" | "TEXT";

export type VariantCustomField = {
  id: number;
  key: string;
  label: string;
  type: VariantCustomFieldType;
  options?: string[];
  sortOrder: number;
};

export type VariantCustomFieldsResponse = {
  workspaceId: number;
  items: VariantCustomField[];
};

export type UploadedProductMediaResponse = {
  id: number;
  cdnUrl: string;
  createdAt: string;
};

/** UI model for uploaded media preview (mapped from API `cdnUrl`). */
export type ProductUploadedMedia = {
  id: number;
  src: string;
};

export type CreateProductVariantCustomFieldExistingFieldValue = {
  field: {
    id: number;
  };
  value: string;
  order: number;
};

export type CreateProductVariantCustomFieldNewFieldValue = {
  field: {
    name: string;
    type: CreateProductCustomFieldType;
  };
  value: string;
  order: number;
};

export type CreateProductVariantCustomFieldValue =
  | CreateProductVariantCustomFieldExistingFieldValue
  | CreateProductVariantCustomFieldNewFieldValue;

export type CreateProductVariantPayload = {
  status: ProductLifecycleStatus;
  customFields: CreateProductVariantCustomFieldValue[];
  price: number;
  inStock: boolean;
  quantity: number;
  sku?: string;
  mediaIds: number[];
};

export type CreateProductPayload = {
  name: string;
  description?: string;
  status: ProductLifecycleStatus;
  productType: ProductType;
  sourceType: ProductCreateSourceType;
  price: number;
  currency: ProductCreateCurrency;
  inStock: boolean;
  quantity: number;
  mediaIds: number[];
  categoryId: number;
  variants: CreateProductVariantPayload[];
};
