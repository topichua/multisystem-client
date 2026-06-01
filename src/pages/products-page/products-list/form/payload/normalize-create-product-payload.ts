import type {
  CreateProductPayload,
  CreateProductVariantCustomFieldValue,
  CreateProductVariantPayload,
  ProductLifecycleStatus,
  ProductType,
} from "@/features/products/model/product-create-api.types";

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

const PRODUCT_CREATE_SOURCE_TYPE = "manual" as const;
const PRODUCT_CREATE_CURRENCY = "UAH" as const;
const PRODUCT_DEFAULT_IN_STOCK = true;

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

export function normalizeCreateProductPayload({
  formValues,
  productType,
  productMedia,
  variants,
}: NormalizeCreateProductPayloadInput): CreateProductPayload {
  const categoryId = formValues.categoryId;
  if (categoryId == null) {
    throw new Error("Product category is required");
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
    sourceType: PRODUCT_CREATE_SOURCE_TYPE,
    price: Number(formValues.price ?? 0),
    currency: PRODUCT_CREATE_CURRENCY,
    inStock: PRODUCT_DEFAULT_IN_STOCK,
    quantity: Number(formValues.quantity ?? 0),
    mediaIds: normalizeProductMediaIds(productMedia),
    categoryId,
    variants: normalizedVariants,
  };
}
