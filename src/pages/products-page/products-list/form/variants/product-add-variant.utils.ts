import type { FormInstance } from "antd";
import type { Dispatch, SetStateAction } from "react";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";

import { EMPTY_PRODUCT_VARIANT_KEY } from "./generate-product-variants";
import type { SelectedCharacteristic } from "./generate-product-variants";
import type { ProductStatus } from "@/features/products/model/product.types";
import type {
  ProductAddVariantFormValues,
  ProductVariantUi,
  VariantMediaItem,
} from "./product-add-variant.types";

export type SelectedCharacteristicColumn = {
  fieldId: number;
  fieldKey: string;
  fieldLabel: string;
  sortOrder: number;
};

type CharacteristicFormRow = {
  attributeId?: number;
  values?: string[];
};

export type SingleCharacteristicFormRow = {
  attributeId?: number;
  value?: string;
};

function isCharacteristicFormRow(
  value: unknown,
): value is CharacteristicFormRow {
  return typeof value === "object" && value !== null;
}

function parseProductAddVariantFormRow(
  value: unknown,
): ProductAddVariantFormValues | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.key !== "string" || !record.key.trim()) {
    return null;
  }

  return {
    key: record.key,
    price: Number(record.price ?? 0),
    quantity: Number(record.quantity ?? 0),
    sku: typeof record.sku === "string" ? record.sku : "",
    discountPrice:
      typeof record.discountPrice === "number"
        ? record.discountPrice
        : undefined,
  };
}

function isSingleCharacteristicFormRow(
  value: unknown,
): value is SingleCharacteristicFormRow {
  return typeof value === "object" && value !== null;
}

export function normalizeSingleCharacteristics(
  raw: unknown,
): Array<{ attributeId: number; value: string }> {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((item) => {
    if (!isSingleCharacteristicFormRow(item)) {
      return [];
    }

    const attributeId = item.attributeId;
    const value = typeof item.value === "string" ? item.value.trim() : "";

    if (
      typeof attributeId !== "number" ||
      !Number.isFinite(attributeId) ||
      !value
    ) {
      return [];
    }

    return [{ attributeId, value }];
  });
}

export function mapCharacteristicFieldSelectOptions(
  options: Array<{ value: number; label: string }>,
  selectedAttributeIds: Iterable<number>,
  currentAttributeId?: number,
): Array<{ value: number; label: string; disabled?: boolean }> {
  const selectedIds = new Set(selectedAttributeIds);

  return options.map((option) => ({
    ...option,
    disabled:
      selectedIds.has(option.value) && option.value !== currentAttributeId,
  }));
}

export function normalizeSelectedCharacteristics(
  raw: unknown,
): SelectedCharacteristic[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((item) => {
    if (!isCharacteristicFormRow(item)) {
      return [];
    }

    const attributeId = item.attributeId;
    const values = item.values;

    if (typeof attributeId !== "number" || !Number.isFinite(attributeId)) {
      return [];
    }

    return [
      {
        attributeId,
        values: Array.isArray(values) ? values : [],
      },
    ];
  });
}

export function indexProductVariantsByKey(
  variants: ProductVariantUi[],
): Map<string, ProductVariantUi> {
  return new Map(variants.map((variant) => [variant.key, variant]));
}

/** Merges editable form fields into variants by stable `key`, never by row index. */
export function mergeProductVariantsWithFormValues(
  variants: ProductVariantUi[],
  formVariantValues: unknown,
): ProductVariantUi[] {
  if (!Array.isArray(formVariantValues)) {
    return variants;
  }

  const formByKey = new Map<string, ProductAddVariantFormValues>();
  for (const row of formVariantValues) {
    const parsed = parseProductAddVariantFormRow(row);
    if (parsed) {
      formByKey.set(parsed.key, parsed);
    }
  }

  return variants.map((variant) => {
    const formValues = formByKey.get(variant.key);
    if (!formValues) {
      return variant;
    }

    return {
      ...variant,
      price: formValues.price,
      quantity: formValues.quantity,
      sku: formValues.sku,
    };
  });
}

export function syncProductVariantsToForm(
  form: FormInstance,
  variants: ProductVariantUi[],
): void {
  form.setFieldValue(
    "variants",
    variants.map((variant) => productVariantUiToFormValues(variant)),
  );
}

function normalizeVariantStatus(status: unknown): ProductStatus {
  if (status === "draft" || status === "active" || status === "archived") {
    return status;
  }

  return "draft";
}

export function createInitialEmptyProductVariant(
  form: FormInstance,
): ProductVariantUi {
  return {
    key: EMPTY_PRODUCT_VARIANT_KEY,
    source: "generated",
    customFields: [],
    status: normalizeVariantStatus(form.getFieldValue("status")),
    price: Number(form.getFieldValue("price") ?? 0),
    quantity: Number(form.getFieldValue("quantity") ?? 0),
    inStock: true,
    sku: "",
    media: [],
  };
}

export function isProductMediaUsedByVariants(
  mediaId: number,
  variants: ProductVariantUi[],
): boolean {
  return variants.some((variant) =>
    variant.media.some(
      (item) => item.id === mediaId && item.origin === "product",
    ),
  );
}

export function getRemovedVariantOnlyMedia(
  previousVariants: ProductVariantUi[],
  nextVariants: ProductVariantUi[],
): VariantMediaItem[] {
  const nextKeys = new Set(nextVariants.map((variant) => variant.key));
  const removedMedia: VariantMediaItem[] = [];
  const seenIds = new Set<number>();

  for (const variant of previousVariants) {
    if (nextKeys.has(variant.key)) {
      continue;
    }

    for (const media of variant.media) {
      if (media.origin !== "variant" || seenIds.has(media.id)) {
        continue;
      }

      seenIds.add(media.id);
      removedMedia.push(media);
    }
  }

  return removedMedia;
}

export function hasMeaningfulVariantUserData(
  variants: ProductVariantUi[],
): boolean {
  if (variants.length > 1) {
    return true;
  }

  return variants.some(
    (variant) =>
      variant.customFields.length > 0 ||
      variant.media.length > 0 ||
      Boolean(variant.sku?.trim()),
  );
}

export function sortVariantCustomFields<T extends { sortOrder: number }>(
  fields: T[],
): T[] {
  return [...fields].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getCharacteristicValueOptions(
  attributeId: number | undefined,
  availableFields: readonly VariantCustomField[],
): Array<{ value: string; label: string }> {
  if (attributeId == null || !Number.isFinite(attributeId)) {
    return [];
  }

  const field = availableFields.find((item) => item.id === attributeId);
  if (!field || field.type !== "options") {
    return [];
  }

  if (!Array.isArray(field.options) || field.options.length === 0) {
    return [];
  }

  return field.options.map((option) => ({
    value: option,
    label: option,
  }));
}

export function productVariantUiToFormValues(
  variant: ProductVariantUi,
): ProductAddVariantFormValues {
  return {
    key: variant.key,
    price: variant.price,
    quantity: variant.quantity,
    sku: variant.sku ?? "",
  };
}

export function seedInitialProductVariant(
  form: FormInstance,
  setProductVariants: Dispatch<SetStateAction<ProductVariantUi[]>>,
): void {
  setProductVariants((current) => {
    if (current.length > 0) {
      return current;
    }

    const initialVariant = createInitialEmptyProductVariant(form);
    form.setFieldValue("variants", [
      productVariantUiToFormValues(initialVariant),
    ]);

    return [initialVariant];
  });
}

export function resolveSelectedCharacteristicColumns(
  selectedCharacteristics: SelectedCharacteristic[],
  availableFields: VariantCustomField[],
): SelectedCharacteristicColumn[] {
  const fieldsById = new Map(availableFields.map((field) => [field.id, field]));
  const columns: SelectedCharacteristicColumn[] = [];

  for (const characteristic of selectedCharacteristics) {
    const field = fieldsById.get(characteristic.attributeId);
    if (!field) {
      continue;
    }

    if (columns.some((column) => column.fieldId === field.id)) {
      continue;
    }

    columns.push({
      fieldId: field.id,
      fieldKey: field.key,
      fieldLabel: field.label,
      sortOrder: field.sortOrder,
    });
  }

  return columns.sort((left, right) => left.sortOrder - right.sortOrder);
}

const MANUAL_VARIANT_KEY_PREFIX = "manual:";

export function generateManualVariantKey(): string {
  return `${MANUAL_VARIANT_KEY_PREFIX}${crypto.randomUUID()}`;
}

export function isManualVariantKey(key: string): boolean {
  return key.startsWith(MANUAL_VARIANT_KEY_PREFIX);
}

export type CreateManualVariantParams = {
  price: number;
  quantity: number;
  status: ProductStatus;
  selectedCharacteristics: SelectedCharacteristic[];
  availableFields: VariantCustomField[];
};

export function createManualVariant({
  price,
  quantity,
  status,
  selectedCharacteristics,
  availableFields,
}: CreateManualVariantParams): ProductVariantUi {
  const columns = resolveSelectedCharacteristicColumns(
    selectedCharacteristics,
    availableFields,
  );

  const customFields = columns.map((column) => ({
    fieldId: column.fieldId,
    fieldKey: column.fieldKey,
    fieldLabel: column.fieldLabel,
    value: "",
  }));

  return {
    key: generateManualVariantKey(),
    source: "manual",
    customFields,
    status: normalizeVariantStatus(status),
    price,
    quantity,
    inStock: true,
    sku: "",
    media: [],
  };
}

export function getVariantOnlyMedia(
  variant: ProductVariantUi,
): VariantMediaItem[] {
  return variant.media.filter((item) => item.origin === "variant");
}

export function buildVariantKeyFromCustomFields(
  customFields: ProductVariantUi["customFields"],
): string {
  if (customFields.length === 0) {
    return "";
  }

  return [...customFields]
    .sort((left, right) => left.fieldId - right.fieldId)
    .map((field) => `${field.fieldId}=${field.value.trim()}`)
    .join("|");
}

export function findDuplicateVariantKeys(
  variants: ProductVariantUi[],
): Set<string> {
  const seenKeys = new Set<string>();
  const duplicates = new Set<string>();

  for (const variant of variants) {
    const effectiveKey =
      variant.source === "manual"
        ? buildVariantKeyFromCustomFields(variant.customFields)
        : variant.key;

    if (!effectiveKey || effectiveKey === EMPTY_PRODUCT_VARIANT_KEY) {
      continue;
    }

    if (seenKeys.has(effectiveKey)) {
      duplicates.add(effectiveKey);
    } else {
      seenKeys.add(effectiveKey);
    }
  }

  return duplicates;
}

export function filterManualVariants(
  variants: ProductVariantUi[],
): ProductVariantUi[] {
  return variants.filter((variant) => variant.source === "manual");
}

export function updateManualVariantCustomField(
  variant: ProductVariantUi,
  fieldId: number,
  value: string,
): ProductVariantUi {
  const updatedCustomFields = variant.customFields.map((field) =>
    field.fieldId === fieldId ? { ...field, value } : field,
  );

  return {
    ...variant,
    customFields: updatedCustomFields,
  };
}
