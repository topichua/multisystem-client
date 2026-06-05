import type {
  CreateProductPayload,
  CreateProductVariantCustomFieldValue,
  CreateProductVariantPayload,
  ProductLifecycleStatus,
  ProductType,
  UpdateProductPayload,
  UpdateProductVariantCustomFieldValue,
  UpdateProductVariantPayload,
} from "@/features/products/model/product-create-api.types";
import {
  PRODUCT_DEFAULT_CURRENCY,
  PRODUCT_DEFAULT_IN_STOCK,
  PRODUCT_DEFAULT_SOURCE_TYPE,
} from "@/features/products/model/product.constants";

import type { ProductCreateFormValues } from "../product-form.types";
import type {
  CharacteristicFieldRef,
  ProductVariantUi,
  UploadedProductMedia,
  VariantMediaItem,
} from "../variants/product-add-variant.types";
import { normalizeSingleCharacteristics } from "../variants/product-add-variant.utils";

export type NormalizeCreateProductPayloadInput = {
  formValues: ProductCreateFormValues;
  productType: ProductType;
  productMedia: UploadedProductMedia[];
  variants: ProductVariantUi[];
};

export type NormalizeUpdateProductPayloadInput =
  NormalizeCreateProductPayloadInput;

export const PRODUCT_CATEGORY_REQUIRED_ERROR = "PRODUCT_CATEGORY_REQUIRED";

function normalizeLifecycleStatus(
  status: unknown,
  fallback: ProductLifecycleStatus = "draft",
): ProductLifecycleStatus {
  if (status === "draft" || status === "active" || status === "archived") {
    return status;
  }

  return fallback;
}

function normalizeVariantCustomFields(
  customFields: ProductVariantUi["customFields"],
): CreateProductVariantCustomFieldValue[] {
  return customFields
    .map((field, index) => normalizeVariantCustomField(field, index))
    .filter((field) => field.value);
}

function normalizeVariantCustomField(
  field: ProductVariantUi["customFields"][number],
  index: number,
): CreateProductVariantCustomFieldValue {
  const value = field.value.trim();
  const order = field.order ?? index;

  if (field.field?.kind === "existing") {
    return {
      field: { id: field.field.id },
      value,
      order,
    };
  }

  if (field.field?.kind === "new") {
    return {
      field: {
        name: field.field.name.trim(),
        type: field.field.type,
      },
      value,
      order,
    };
  }

  return {
    field: { id: field.fieldId },
    value,
    order,
  };
}

function normalizeUpdateVariantCustomFields(
  customFields: ProductVariantUi["customFields"],
): UpdateProductVariantCustomFieldValue[] {
  return customFields
    .map((field, index) => normalizeUpdateVariantCustomField(field, index))
    .filter((field) => field.value);
}

function normalizeUpdateVariantCustomField(
  field: ProductVariantUi["customFields"][number],
  index: number,
): UpdateProductVariantCustomFieldValue {
  const value = field.value.trim();
  const order = field.order ?? index;

  if (field.field?.kind === "existing") {
    return {
      field: {
        id: field.field.id,
        name: field.fieldLabel,
        type: field.fieldType,
      },
      value,
      order,
    };
  }

  if (field.field?.kind === "new") {
    return {
      field: {
        name: field.field.name.trim(),
        type: field.field.type,
      },
      value,
      order,
    };
  }

  return {
    field: {
      id: field.fieldId,
      name: field.fieldLabel,
      type: field.fieldType,
    },
    value,
    order,
  };
}

export function normalizeCustomFieldRef(
  field: CharacteristicFieldRef,
): CreateProductVariantCustomFieldValue["field"] {
  if (field.kind === "existing") {
    return { id: field.id };
  }

  return {
    name: field.name.trim(),
    type: field.type,
  };
}

function normalizeOptionalSku(
  sku?: string,
): Pick<CreateProductVariantPayload, "sku"> {
  const trimmed = sku?.trim();
  if (!trimmed) {
    return {};
  }

  return { sku: trimmed };
}

function normalizeVariantMediaIds(media: VariantMediaItem[]): number[] {
  return media.map((item) => item.id);
}

function normalizeProductMediaIds(
  productMedia: UploadedProductMedia[],
): number[] {
  return productMedia.map((item) => item.id);
}

function buildSingleProductCustomFields(
  formValues: ProductCreateFormValues,
  variantsFromSubmit: ProductVariantUi[],
): CreateProductVariantCustomFieldValue[] {
  if (variantsFromSubmit.length === 1) {
    const variantCustomFields = normalizeVariantCustomFields(
      variantsFromSubmit[0].customFields,
    );
    if (variantCustomFields.length > 0) {
      return variantCustomFields;
    }
  }

  const formValuesWithCharacteristics =
    formValues as ProductCreateFormValues & {
      singleCharacteristics?: unknown;
    };

  return normalizeSingleCharacteristics(
    formValuesWithCharacteristics.singleCharacteristics,
  ).map(normalizeSingleCharacteristicCustomField);
}

function normalizeSingleCharacteristicCustomField(
  item: ReturnType<typeof normalizeSingleCharacteristics>[number],
): CreateProductVariantCustomFieldValue {
  if (item.field.kind === "existing") {
    return {
      field: { id: item.field.id },
      value: item.value,
      order: item.order,
    };
  }

  return {
    field: {
      name: item.field.name.trim(),
      type: item.field.type,
    },
    value: item.value,
    order: item.order,
  };
}

function normalizeUpdateSingleCharacteristicCustomField(
  item: ReturnType<typeof normalizeSingleCharacteristics>[number],
): UpdateProductVariantCustomFieldValue {
  if (item.field.kind === "existing") {
    return {
      field: { id: item.field.id },
      value: item.value,
      order: item.order,
    };
  }

  return {
    field: {
      name: item.field.name.trim(),
      type: item.field.type,
    },
    value: item.value,
    order: item.order,
  };
}

function buildSingleProductVariant(
  formValues: ProductCreateFormValues,
  productStatus: ProductLifecycleStatus,
  variantsFromSubmit: ProductVariantUi[],
): CreateProductVariantPayload {
  const variantMedia =
    variantsFromSubmit.length === 1 ? variantsFromSubmit[0].media : [];

  return {
    status: productStatus,
    customFields: buildSingleProductCustomFields(
      formValues,
      variantsFromSubmit,
    ),
    price: Number(formValues.price ?? 0),
    inStock: PRODUCT_DEFAULT_IN_STOCK,
    quantity: Number(formValues.quantity ?? 0),
    mediaIds: normalizeVariantMediaIds(variantMedia),
  };
}

function buildSingleProductUpdateVariant(
  formValues: ProductCreateFormValues,
  productStatus: ProductLifecycleStatus,
  variantsFromSubmit: ProductVariantUi[],
): UpdateProductVariantPayload {
  const existingVariant =
    variantsFromSubmit.length > 0 ? variantsFromSubmit[0] : undefined;
  const variantMedia = existingVariant?.media ?? [];

  return {
    ...(existingVariant?.id != null ? { id: existingVariant.id } : {}),
    status: productStatus,
    customFields: normalizeSingleCharacteristics(
      (
        formValues as ProductCreateFormValues & {
          singleCharacteristics?: unknown;
        }
      ).singleCharacteristics,
    ).map(normalizeUpdateSingleCharacteristicCustomField),
    price: Number(formValues.price ?? 0),
    inStock: PRODUCT_DEFAULT_IN_STOCK,
    quantity: Number(formValues.quantity ?? 0),
    mediaIds: normalizeVariantMediaIds(variantMedia),
    ...normalizeOptionalSku(existingVariant?.sku),
  };
}

function buildVariantsProductVariant(
  variant: ProductVariantUi,
  productStatus: ProductLifecycleStatus,
): CreateProductVariantPayload {
  const status = normalizeLifecycleStatus(variant.status, productStatus);

  return {
    status,
    customFields: normalizeVariantCustomFields(variant.customFields),
    price: Number(variant.price ?? 0),
    inStock: PRODUCT_DEFAULT_IN_STOCK,
    quantity: Number(variant.quantity ?? 0),
    mediaIds: normalizeVariantMediaIds(variant.media),
    ...normalizeOptionalSku(variant.sku),
  };
}

function buildVariantsProductUpdateVariant(
  variant: ProductVariantUi,
  productStatus: ProductLifecycleStatus,
): UpdateProductVariantPayload {
  const status = normalizeLifecycleStatus(variant.status, productStatus);

  return {
    ...(variant.id != null ? { id: variant.id } : {}),
    status,
    customFields: normalizeUpdateVariantCustomFields(variant.customFields),
    price: Number(variant.price ?? 0),
    inStock: PRODUCT_DEFAULT_IN_STOCK,
    quantity: Number(variant.quantity ?? 0),
    mediaIds: normalizeVariantMediaIds(variant.media),
    ...normalizeOptionalSku(variant.sku),
  };
}

export function normalizeCreateProductPayload({
  formValues,
  productType,
  productMedia,
  variants,
}: NormalizeCreateProductPayloadInput): CreateProductPayload {
  const categoryId = formValues.categoryId;
  if (categoryId == null) {
    throw new Error(PRODUCT_CATEGORY_REQUIRED_ERROR);
  }

  const productStatus = normalizeLifecycleStatus(formValues.status);
  const description = formValues.description.trim() ?? "";

  const normalizedVariants =
    productType === "single"
      ? [buildSingleProductVariant(formValues, productStatus, variants)]
      : variants.map((variant) =>
          buildVariantsProductVariant(variant, productStatus),
        );

  if (productType === "single" && normalizedVariants.length !== 1) {
    throw new Error("Single product must include exactly one variant");
  }

  if (productType === "variants" && normalizedVariants.length === 0) {
    throw new Error("Variants product must include at least one variant");
  }

  return {
    name: formValues.name.trim() ?? "",
    ...(description ? { description } : {}),
    status: productStatus,
    productType,
    sourceType: PRODUCT_DEFAULT_SOURCE_TYPE,
    price: Number(formValues.price ?? 0),
    currency: PRODUCT_DEFAULT_CURRENCY,
    inStock: PRODUCT_DEFAULT_IN_STOCK,
    quantity: Number(formValues.quantity ?? 0),
    mediaIds: normalizeProductMediaIds(productMedia),
    categoryId,
    variants: normalizedVariants,
  };
}

export function normalizeUpdateProductPayload({
  formValues,
  productType,
  productMedia,
  variants,
}: NormalizeUpdateProductPayloadInput): UpdateProductPayload {
  const categoryId = formValues.categoryId;
  if (categoryId == null) {
    throw new Error(PRODUCT_CATEGORY_REQUIRED_ERROR);
  }

  const productStatus = normalizeLifecycleStatus(formValues.status);
  const description = formValues.description.trim() ?? "";

  const normalizedVariants =
    productType === "single"
      ? [buildSingleProductUpdateVariant(formValues, productStatus, variants)]
      : variants.map((variant) =>
          buildVariantsProductUpdateVariant(variant, productStatus),
        );

  if (productType === "variants" && normalizedVariants.length === 0) {
    throw new Error("Variants product must include at least one variant");
  }

  return {
    name: formValues.name.trim() ?? "",
    description,
    status: productStatus,
    productType,
    sourceType: PRODUCT_DEFAULT_SOURCE_TYPE,
    price: Number(formValues.price ?? 0),
    currency: PRODUCT_DEFAULT_CURRENCY,
    inStock: PRODUCT_DEFAULT_IN_STOCK,
    quantity: Number(formValues.quantity ?? 0),
    mediaIds: normalizeProductMediaIds(productMedia),
    categoryId,
    variants: normalizedVariants,
  };
}
