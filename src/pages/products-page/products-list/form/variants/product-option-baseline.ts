import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type {
  CharacteristicFieldRef,
  ProductVariantUi,
} from "./product-add-variant.types";
import {
  normalizeCharacteristicName,
  normalizeSelectedCharacteristics,
} from "./product-add-variant.utils";

export type ProductOptionCharacteristicBaseline = {
  fieldId: number;
  fieldStableKey: string;
  values: readonly string[];
  normalizedValues: readonly string[];
};

export type ProductOptionCharacteristicsBaseline = {
  productId: number | null;
  initialProductType: "variants" | null;
  characteristics: readonly ProductOptionCharacteristicBaseline[];
};

export type ProductOptionBaselineValidationResult =
  | { valid: true }
  | {
      valid: false;
      reason:
        "missing-characteristic" | "missing-value" | "added-characteristic";
      fieldStableKey: string;
      value?: string;
    };

export const EMPTY_PRODUCT_OPTION_BASELINE: ProductOptionCharacteristicsBaseline =
  Object.freeze({
    productId: null,
    initialProductType: null,
    characteristics: Object.freeze([]),
  });

export function getCharacteristicFieldStableKey(
  field: CharacteristicFieldRef,
): string {
  return field.kind === "existing"
    ? `existing:${field.id}`
    : `new:${field.clientKey}`;
}

export function normalizeCharacteristicOptionValue(value: string): string {
  return normalizeCharacteristicName(value);
}

function getExistingFieldId(field: CharacteristicFieldRef | undefined): number {
  return field?.kind === "existing" ? field.id : 0;
}

export function buildProductOptionCharacteristicsBaseline(
  productId: number,
  variants: readonly ProductVariantUi[],
): ProductOptionCharacteristicsBaseline {
  const byStableKey = new Map<
    string,
    {
      fieldId: number;
      fieldStableKey: string;
      values: string[];
      normalizedValues: Set<string>;
    }
  >();

  for (const variant of variants) {
    for (const customField of variant.customFields) {
      if (customField.fieldType !== "OPTION") {
        continue;
      }

      const fieldId = getExistingFieldId(customField.field);
      if (!fieldId) {
        continue;
      }

      const value = customField.value.trim();
      const normalizedValue = normalizeCharacteristicOptionValue(value);
      if (!normalizedValue) {
        continue;
      }

      const fieldStableKey = `existing:${fieldId}`;
      const baseline = byStableKey.get(fieldStableKey) ?? {
        fieldId,
        fieldStableKey,
        values: [],
        normalizedValues: new Set<string>(),
      };

      if (!baseline.normalizedValues.has(normalizedValue)) {
        baseline.normalizedValues.add(normalizedValue);
        baseline.values.push(value);
      }

      byStableKey.set(fieldStableKey, baseline);
    }
  }

  return {
    productId,
    initialProductType: "variants",
    characteristics: [...byStableKey.values()]
      .sort((left, right) => left.fieldId - right.fieldId)
      .map((item) => ({
        fieldId: item.fieldId,
        fieldStableKey: item.fieldStableKey,
        values: [...item.values],
        normalizedValues: [...item.normalizedValues],
      })),
  };
}

export function hasProductOptionCharacteristicsBaseline(
  baseline: ProductOptionCharacteristicsBaseline,
): boolean {
  return (
    baseline.productId != null && baseline.initialProductType === "variants"
  );
}

export function isProductOptionBaselineActiveForProduct(
  baseline: ProductOptionCharacteristicsBaseline,
  productId: number | null,
): boolean {
  return (
    productId != null &&
    baseline.productId === productId &&
    baseline.initialProductType === "variants"
  );
}

export function isBaselineOptionCharacteristic(
  baseline: ProductOptionCharacteristicsBaseline,
  field: CharacteristicFieldRef | undefined,
): boolean {
  if (field?.kind !== "existing") {
    return false;
  }

  const fieldStableKey = getCharacteristicFieldStableKey(field);
  return baseline.characteristics.some(
    (characteristic) => characteristic.fieldStableKey === fieldStableKey,
  );
}

export function getBaselineOptionValues(
  baseline: ProductOptionCharacteristicsBaseline,
  field: CharacteristicFieldRef | undefined,
): readonly string[] {
  if (field?.kind !== "existing") {
    return [];
  }

  const fieldStableKey = getCharacteristicFieldStableKey(field);
  return (
    baseline.characteristics.find(
      (characteristic) => characteristic.fieldStableKey === fieldStableKey,
    )?.values ?? []
  );
}

export function mergeLockedOptionValues(
  values: readonly string[],
  lockedValues: readonly string[] = [],
  maxCount?: number,
): string[] {
  const normalizedLockedValues = new Set(
    lockedValues.map(normalizeCharacteristicOptionValue).filter(Boolean),
  );
  const normalizedSeen = new Set<string>();
  const merged: string[] = [];

  for (const lockedValue of lockedValues) {
    const value = lockedValue.trim();
    const normalizedValue = normalizeCharacteristicOptionValue(value);
    if (!normalizedValue || normalizedSeen.has(normalizedValue)) {
      continue;
    }

    normalizedSeen.add(normalizedValue);
    merged.push(value);
  }

  for (const rawValue of values) {
    const value = rawValue.trim();
    const normalizedValue = normalizeCharacteristicOptionValue(value);
    if (
      !normalizedValue ||
      normalizedSeen.has(normalizedValue) ||
      normalizedLockedValues.has(normalizedValue)
    ) {
      continue;
    }

    normalizedSeen.add(normalizedValue);
    merged.push(value);
  }

  if (lockedValues.length === 0 && maxCount === 1 && merged.length > 1) {
    return merged.slice(-1);
  }

  return merged;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getCurrentCharacteristicFieldStableKey(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const field = value.field;
  if (isRecord(field) && field.kind === "existing") {
    const id = field.id;
    return typeof id === "number" && Number.isFinite(id)
      ? `existing:${id}`
      : null;
  }

  const attributeId = value.attributeId;
  return typeof attributeId === "number" && Number.isFinite(attributeId)
    ? `existing:${attributeId}`
    : null;
}

function getCurrentCharacteristicValues(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.values)) {
    return value.values.flatMap((item) =>
      typeof item === "string" ? [item] : [],
    );
  }

  return typeof value.value === "string" ? [value.value] : [];
}

function getVariantOptionFieldStableKeys(
  variants: readonly ProductVariantUi[],
): Set<string> {
  const fieldStableKeys = new Set<string>();

  for (const variant of variants) {
    for (const customField of variant.customFields) {
      if (customField.fieldType !== "OPTION") {
        continue;
      }

      if (customField.field) {
        fieldStableKeys.add(getCharacteristicFieldStableKey(customField.field));
        continue;
      }

      if (customField.fieldId) {
        fieldStableKeys.add(`existing:${customField.fieldId}`);
      }
    }
  }

  return fieldStableKeys;
}

function getCurrentOptionFieldStableKeys(
  rawCharacteristics: unknown,
  availableFields: readonly VariantCustomField[],
): Set<string> {
  const fieldStableKeys = new Set<string>();
  const selectedCharacteristics = normalizeSelectedCharacteristics(
    rawCharacteristics,
    availableFields,
  );

  for (const characteristic of selectedCharacteristics) {
    if (characteristic.fieldType === "OPTION") {
      fieldStableKeys.add(
        getCharacteristicFieldStableKey(characteristic.field),
      );
    }
  }

  return fieldStableKeys;
}

export function validateProductOptionBaselinePreserved(
  baseline: ProductOptionCharacteristicsBaseline,
  productId: number | null,
  rawCharacteristics: unknown,
  variants: readonly ProductVariantUi[],
  availableFields: readonly VariantCustomField[] = [],
): ProductOptionBaselineValidationResult {
  if (!isProductOptionBaselineActiveForProduct(baseline, productId)) {
    return { valid: true };
  }

  const currentByFieldStableKey = new Map<string, Set<string>>();

  if (Array.isArray(rawCharacteristics)) {
    for (const row of rawCharacteristics) {
      const fieldStableKey = getCurrentCharacteristicFieldStableKey(row);
      if (!fieldStableKey) {
        continue;
      }

      currentByFieldStableKey.set(
        fieldStableKey,
        new Set(
          getCurrentCharacteristicValues(row)
            .map(normalizeCharacteristicOptionValue)
            .filter(Boolean),
        ),
      );
    }
  }

  for (const characteristic of baseline.characteristics) {
    const currentValues = currentByFieldStableKey.get(
      characteristic.fieldStableKey,
    );

    if (!currentValues) {
      return {
        valid: false,
        reason: "missing-characteristic",
        fieldStableKey: characteristic.fieldStableKey,
      };
    }

    for (const value of characteristic.normalizedValues) {
      if (!currentValues.has(value)) {
        return {
          valid: false,
          reason: "missing-value",
          fieldStableKey: characteristic.fieldStableKey,
          value,
        };
      }
    }
  }

  const baselineFieldStableKeys = new Set(
    baseline.characteristics.map(
      (characteristic) => characteristic.fieldStableKey,
    ),
  );
  const currentOptionFieldStableKeys = getCurrentOptionFieldStableKeys(
    rawCharacteristics,
    availableFields,
  );
  for (const fieldStableKey of getVariantOptionFieldStableKeys(variants)) {
    currentOptionFieldStableKeys.add(fieldStableKey);
  }

  for (const fieldStableKey of currentOptionFieldStableKeys) {
    if (!baselineFieldStableKeys.has(fieldStableKey)) {
      return {
        valid: false,
        reason: "added-characteristic",
        fieldStableKey,
      };
    }
  }

  return { valid: true };
}
