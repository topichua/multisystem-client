import type { CreateProductCustomFieldType } from "@/features/products/model/product-create-api.types";

import type {
  CharacteristicFieldRef,
  ProductVariantUi,
} from "./product-add-variant.types";

export const EMPTY_PRODUCT_VARIANT_KEY = "variant:empty";

export type SelectedCharacteristic = {
  field: CharacteristicFieldRef;
  fieldKey: string;
  fieldLabel: string;
  fieldType: CreateProductCustomFieldType;
  values: string[];
  order: number;
};

export type GenerateProductVariantsBaseValues = {
  price: number;
  quantity: number;
  status: ProductVariantUi["status"];
};

const DEFAULT_VARIANT_IN_STOCK = true;

export type GenerateProductVariantsParams = {
  selectedCharacteristics: SelectedCharacteristic[];
  base: GenerateProductVariantsBaseValues;
  previousVariants: ProductVariantUi[];
};

type CharacteristicDimension = {
  field: CharacteristicFieldRef;
  fieldStableKey: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: CreateProductCustomFieldType;
  values: string[];
  order: number;
};

type FieldValuePair = {
  field: CharacteristicFieldRef;
  fieldStableKey: string;
  value: string;
};

function getFieldStableKey(field: CharacteristicFieldRef): string {
  return field.kind === "existing"
    ? `existing:${field.id}`
    : `new:${field.clientKey}`;
}

function normalizeCharacteristicValues(values: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of values) {
    const value = raw.trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    normalized.push(value);
  }

  return normalized;
}

function resolveCharacteristicDimensions(
  selectedCharacteristics: SelectedCharacteristic[],
): CharacteristicDimension[] {
  const dimensions = selectedCharacteristics.flatMap((characteristic) => {
    const values = normalizeCharacteristicValues(characteristic.values ?? []);

    if (values.length === 0) {
      return [];
    }

    return [
      {
        field: characteristic.field,
        fieldStableKey: getFieldStableKey(characteristic.field),
        fieldKey: characteristic.fieldKey,
        fieldLabel: characteristic.fieldLabel,
        fieldType: characteristic.fieldType,
        values,
        order: characteristic.order,
      },
    ];
  });

  return dimensions.sort((left, right) => left.order - right.order);
}

function cartesianProduct<T>(dimensions: T[][]): T[][] {
  if (dimensions.length === 0) {
    return [[]];
  }

  return dimensions.reduce<T[][]>(
    (combinations, dimensionValues) =>
      combinations.flatMap((combination) =>
        dimensionValues.map((value) => [...combination, value]),
      ),
    [[]],
  );
}

/** Stable key from sorted `field=value` segments (values trimmed). */
export function buildProductVariantKey(pairs: FieldValuePair[]): string {
  return [...pairs]
    .sort((left, right) =>
      left.fieldStableKey.localeCompare(right.fieldStableKey),
    )
    .map((pair) => `${pair.fieldStableKey}=${pair.value.trim()}`)
    .join("|");
}

function getGeneratedOptionCustomFields(variant: ProductVariantUi): Array<{
  fieldStableKey: string;
  value: string;
}> {
  if (variant.source !== "generated") {
    return [];
  }

  return variant.customFields
    .filter((field) => field.fieldType !== "TEXT")
    .flatMap((field) => {
      const value = field.value.trim();
      if (!value) {
        return [];
      }

      return [
        {
          fieldStableKey: field.field
            ? getFieldStableKey(field.field)
            : `existing:${field.fieldId}`,
          value,
        },
      ];
    });
}

function findPreviousVariantForPairs(
  pairs: FieldValuePair[],
  previousVariants: ProductVariantUi[],
): ProductVariantUi | undefined {
  const pairsByField = new Map(
    pairs.map((pair) => [pair.fieldStableKey, pair.value.trim()]),
  );

  let bestMatch:
    | {
        variant: ProductVariantUi;
        matchedFieldCount: number;
      }
    | undefined;

  for (const variant of previousVariants) {
    const previousFields = getGeneratedOptionCustomFields(variant);
    if (previousFields.length === 0) {
      continue;
    }

    const isSubsetMatch = previousFields.every(
      (field) => pairsByField.get(field.fieldStableKey) === field.value,
    );
    if (!isSubsetMatch) {
      continue;
    }

    if (!bestMatch || previousFields.length > bestMatch.matchedFieldCount) {
      bestMatch = {
        variant,
        matchedFieldCount: previousFields.length,
      };
    }
  }

  return bestMatch?.variant;
}

function buildVariantFromPairs(
  pairs: FieldValuePair[],
  dimensions: CharacteristicDimension[],
  base: GenerateProductVariantsBaseValues,
  previousByKey: Map<string, ProductVariantUi>,
  previousVariants: ProductVariantUi[],
): ProductVariantUi {
  const key = buildProductVariantKey(pairs);
  const exactPrevious = previousByKey.get(key);
  const previous =
    exactPrevious ?? findPreviousVariantForPairs(pairs, previousVariants);

  const customFields = pairs.map((pair) => {
    const dimension = dimensions.find(
      (item) => item.fieldStableKey === pair.fieldStableKey,
    );

    return {
      fieldId: pair.field.kind === "existing" ? pair.field.id : 0,
      field: pair.field,
      fieldKey: dimension?.fieldKey ?? pair.fieldStableKey,
      fieldLabel: dimension?.fieldLabel ?? pair.fieldStableKey,
      fieldType: dimension?.fieldType ?? "OPTION",
      value: pair.value,
      order: dimension?.order ?? 0,
    };
  });

  return {
    ...(exactPrevious?.id != null ? { id: exactPrevious.id } : {}),
    key,
    source: "generated",
    customFields,
    status: previous?.status ?? base.status,
    price: previous?.price ?? base.price,
    quantity: previous?.quantity ?? base.quantity,
    inStock: previous?.inStock ?? DEFAULT_VARIANT_IN_STOCK,
    avgPurchasePrice: previous?.avgPurchasePrice,
    sku: previous?.sku ?? "",
    media: previous ? [...previous.media] : [],
  };
}

// function buildEmptyVariant(
//   base: GenerateProductVariantsBaseValues,
//   previousByKey: Map<string, ProductVariantUi>,
// ): ProductVariantUi {
//   const previous = previousByKey.get(EMPTY_PRODUCT_VARIANT_KEY);

//   return {
//     key: EMPTY_PRODUCT_VARIANT_KEY,
//     source: 'generated',
//     customFields: [],
//     status: previous?.status ?? base.status,
//     price: previous?.price ?? base.price,
//     quantity: previous?.quantity ?? base.quantity,
//     inStock: previous?.inStock ?? DEFAULT_VARIANT_IN_STOCK,
//     sku: previous?.sku ?? '',
//     media: previous ? [...previous.media] : [],
//   };
// }

export function generateProductVariantsFromCharacteristics({
  selectedCharacteristics,
  base,
  previousVariants,
}: GenerateProductVariantsParams): ProductVariantUi[] {
  const previousByKey = new Map(
    previousVariants.map((variant) => [variant.key, variant]),
  );
  const dimensions = resolveCharacteristicDimensions(selectedCharacteristics);
  const optionDimensions = dimensions.filter(
    (dimension) => dimension.fieldType === "OPTION",
  );
  const textFields = dimensions
    .filter((dimension) => dimension.fieldType === "TEXT")
    .flatMap((dimension) =>
      dimension.values.map((value) => ({
        fieldId: dimension.field.kind === "existing" ? dimension.field.id : 0,
        field: dimension.field,
        fieldKey: dimension.fieldKey,
        fieldLabel: dimension.fieldLabel,
        fieldType: dimension.fieldType,
        value,
        order: dimension.order,
      })),
    );

  if (optionDimensions.length === 0) {
    return [];
  }

  const valueCombinations = cartesianProduct(
    optionDimensions.map((dimension) =>
      dimension.values.map((value) => ({
        field: dimension.field,
        fieldStableKey: dimension.fieldStableKey,
        value,
      })),
    ),
  );

  return valueCombinations.map((pairs) => {
    const variant = buildVariantFromPairs(
      pairs,
      optionDimensions,
      base,
      previousByKey,
      previousVariants,
    );

    return {
      ...variant,
      customFields: [...variant.customFields, ...textFields].sort(
        (left, right) => (left.order ?? 0) - (right.order ?? 0),
      ),
    };
  });
}

/*
 * Examples (no test runner):
 *
 * const fields = [
 *   { id: 1, key: 'color', label: 'Color', type: 'text', options: [], sortOrder: 0 },
 *   { id: 2, key: 'size', label: 'Size', type: 'text', options: [], sortOrder: 1 },
 * ];
 *
 * generateProductVariantsFromCharacteristics({
 *   selectedCharacteristics: [
 *     { attributeId: 1, values: ['Black', 'White'] },
 *     { attributeId: 2, values: ['S', 'M'] },
 *   ],
 *   availableFields: fields,
 *   base: { price: 100, quantity: 5, status: 'draft' },
 *   previousVariants: [],
 * });
 * // => 4 variants with keys:
 * //    "1=Black|2=S", "1=Black|2=M", "1=White|2=S", "1=White|2=M"
 *
 * generateProductVariantsFromCharacteristics({
 *   selectedCharacteristics: [],
 *   availableFields: fields,
 *   base: { price: 100, quantity: 5, status: 'draft' },
 *   previousVariants: [],
 * });
 * // => [{ key: 'variant:empty', customFields: [], price: 100, ... }]
 *
 * // Regenerate preserves matching variant data:
 * const previous = generateProductVariantsFromCharacteristics({ ... });
 * const updatedPrevious = previous.map((variant, index) =>
 *   index === 0 ? { ...variant, price: 250, sku: 'SKU-1' } : variant,
 * );
 * generateProductVariantsFromCharacteristics({
 *   selectedCharacteristics: [
 *     { attributeId: 1, values: ['Black', 'White'] },
 *     { attributeId: 2, values: ['S', 'M'] },
 *   ],
 *   availableFields: fields,
 *   base: { price: 100, quantity: 5, status: 'draft' },
 *   previousVariants: updatedPrevious,
 * });
 * // => first variant keeps price: 250 and sku: 'SKU-1'
 */
