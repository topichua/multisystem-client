import type { FormInstance } from "antd";
import type { Dispatch, SetStateAction } from "react";

import type {
  CreateProductCustomFieldType,
  VariantCustomField,
  VariantCustomFieldType,
} from "@/features/products/model/product-create-api.types";

import { EMPTY_PRODUCT_VARIANT_KEY } from "./generate-product-variants";
import type { SelectedCharacteristic } from "./generate-product-variants";
import type { ProductStatus } from "@/features/products/model/product.types";
import type {
  CharacteristicFieldRef,
  ProductAddVariantFormValues,
  ProductVariantUi,
  VariantMediaItem,
} from "./product-add-variant.types";

export type SelectedCharacteristicColumn = {
  fieldId: number;
  field: CharacteristicFieldRef;
  fieldStableKey: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: CreateProductCustomFieldType;
  order: number;
};

export function mapResponseFieldTypeToCreateFieldType(
  type: VariantCustomFieldType,
): CreateProductCustomFieldType {
  return type === "options" ? "OPTION" : "TEXT";
}

export function normalizeCharacteristicName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function getCharacteristicFieldStableKey(
  field: CharacteristicFieldRef,
): string {
  return field.kind === "existing"
    ? `existing:${field.id}`
    : `new:${field.clientKey}`;
}

export function getCharacteristicFieldLabel(
  field: CharacteristicFieldRef,
  availableFields: readonly VariantCustomField[],
): string {
  if (field.kind === "new") {
    return field.name;
  }

  return (
    availableFields.find((availableField) => availableField.id === field.id)
      ?.label ?? String(field.id)
  );
}

export function getCharacteristicFieldType(
  field: CharacteristicFieldRef,
  availableFields: readonly VariantCustomField[],
): CreateProductCustomFieldType | null {
  if (field.kind === "new") {
    return field.type;
  }

  const availableField = availableFields.find((item) => item.id === field.id);
  return availableField
    ? mapResponseFieldTypeToCreateFieldType(availableField.type)
    : null;
}

export function isOptionCharacteristic(
  field: CharacteristicFieldRef,
  availableFields: readonly VariantCustomField[],
): boolean {
  return getCharacteristicFieldType(field, availableFields) === "OPTION";
}

export function isTextCharacteristic(
  field: CharacteristicFieldRef,
  availableFields: readonly VariantCustomField[],
): boolean {
  return getCharacteristicFieldType(field, availableFields) === "TEXT";
}

type CharacteristicFormRow = {
  field?: CharacteristicFieldRef;
  attributeId?: number;
  values?: string[];
  value?: string;
};

export type SingleCharacteristicFormRow = {
  field?: CharacteristicFieldRef;
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
  };
}

function isSingleCharacteristicFormRow(
  value: unknown,
): value is SingleCharacteristicFormRow {
  return typeof value === "object" && value !== null;
}

export function normalizeSingleCharacteristics(raw: unknown): Array<{
  field: CharacteristicFieldRef;
  attributeId?: number;
  value: string;
  order: number;
}> {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((item, index) => {
    if (!isSingleCharacteristicFormRow(item)) {
      return [];
    }

    const attributeId = item.attributeId;
    const field =
      item.field ??
      (typeof attributeId === "number" && Number.isFinite(attributeId)
        ? ({
            kind: "existing",
            id: attributeId,
          } satisfies CharacteristicFieldRef)
        : undefined);
    const value = typeof item.value === "string" ? item.value.trim() : "";

    if (!field || !value) {
      return [];
    }

    return [
      {
        field,
        attributeId: field.kind === "existing" ? field.id : undefined,
        value,
        order: index,
      },
    ];
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
  availableFields: readonly VariantCustomField[] = [],
): SelectedCharacteristic[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((item, index) => {
    if (!isCharacteristicFormRow(item)) {
      return [];
    }

    const attributeId = item.attributeId;
    const field =
      item.field ??
      (typeof attributeId === "number" && Number.isFinite(attributeId)
        ? ({
            kind: "existing",
            id: attributeId,
          } satisfies CharacteristicFieldRef)
        : undefined);
    const values = item.values;

    if (!field) {
      return [];
    }

    const fieldType = getCharacteristicFieldType(field, availableFields);
    if (!fieldType) {
      return [];
    }

    const fieldStableKey = getCharacteristicFieldStableKey(field);

    return [
      {
        field,
        fieldKey:
          field.kind === "existing"
            ? (availableFields.find((item) => item.id === field.id)?.key ??
              fieldStableKey)
            : field.clientKey,
        fieldLabel: getCharacteristicFieldLabel(field, availableFields),
        fieldType,
        values: Array.isArray(values)
          ? values
          : typeof item.value === "string"
            ? [item.value]
            : [],
        order: index,
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

  return field.options.flatMap((option) => {
    const label = getCharacteristicOptionLabel(option);
    if (!label) {
      return [];
    }

    return [{ value: label, label }];
  });
}

/**
 * List API returns `{ id, label, archivedAt }`; older payloads used plain strings.
 * Archived options are excluded from product form selects.
 */
function getCharacteristicOptionLabel(option: unknown): string | null {
  if (typeof option === "string") {
    const trimmed = option.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (!option || typeof option !== "object") {
    return null;
  }

  const record = option as Record<string, unknown>;
  if (record.archivedAt != null && record.archivedAt !== "") {
    return null;
  }

  if (typeof record.label !== "string") {
    return null;
  }

  const trimmed = record.label.trim();
  return trimmed.length > 0 ? trimmed : null;
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
): SelectedCharacteristicColumn[] {
  const columns: SelectedCharacteristicColumn[] = [];

  for (const characteristic of selectedCharacteristics) {
    const fieldStableKey = getCharacteristicFieldStableKey(
      characteristic.field,
    );

    if (columns.some((column) => column.fieldStableKey === fieldStableKey)) {
      continue;
    }

    columns.push({
      fieldId:
        characteristic.field.kind === "existing" ? characteristic.field.id : 0,
      field: characteristic.field,
      fieldStableKey,
      fieldKey: characteristic.fieldKey,
      fieldLabel: characteristic.fieldLabel,
      fieldType: characteristic.fieldType,
      order: characteristic.order,
    });
  }

  return columns.sort((left, right) => left.order - right.order);
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
};

export function createManualVariant({
  price,
  quantity,
  status,
  selectedCharacteristics,
}: CreateManualVariantParams): ProductVariantUi {
  const columns = resolveSelectedCharacteristicColumns(selectedCharacteristics);

  const customFields = columns.map((column) => ({
    fieldId: column.fieldId,
    field: column.field,
    fieldKey: column.fieldKey,
    fieldLabel: column.fieldLabel,
    fieldType: column.fieldType,
    value: "",
    order: column.order,
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

export function syncManualVariantCustomFields(
  variant: ProductVariantUi,
  selectedCharacteristics: SelectedCharacteristic[],
): ProductVariantUi {
  const columns = resolveSelectedCharacteristicColumns(selectedCharacteristics);
  const fieldsByStableKey = new Map(
    variant.customFields.map((field) => [
      getProductVariantCustomFieldStableKey(field),
      field,
    ]),
  );

  return {
    ...variant,
    customFields: columns.map((column) => {
      const previous = fieldsByStableKey.get(column.fieldStableKey);

      return {
        fieldId: column.fieldId,
        field: column.field,
        fieldKey: column.fieldKey,
        fieldLabel: column.fieldLabel,
        fieldType: column.fieldType,
        value: previous?.value ?? "",
        order: column.order,
      };
    }),
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
    .filter((field) => field.fieldType !== "TEXT")
    .sort((left, right) =>
      getProductVariantCustomFieldStableKey(left).localeCompare(
        getProductVariantCustomFieldStableKey(right),
      ),
    )
    .map(
      (field) =>
        `${getProductVariantCustomFieldStableKey(field)}=${field.value.trim()}`,
    )
    .join("|");
}

function getProductVariantCustomFieldStableKey(
  field: ProductVariantUi["customFields"][number],
): string {
  return field.field
    ? getCharacteristicFieldStableKey(field.field)
    : `existing:${field.fieldId}`;
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
  fieldStableKey: string,
  value: string,
): ProductVariantUi {
  const updatedCustomFields = variant.customFields.map((field) =>
    getProductVariantCustomFieldStableKey(field) === fieldStableKey
      ? { ...field, value }
      : field,
  );

  return {
    ...variant,
    customFields: updatedCustomFields,
  };
}
