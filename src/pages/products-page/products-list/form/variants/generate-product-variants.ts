import type { VariantCustomField } from "@/features/products/model/product-create-api.types";

import type { ProductVariantUi } from "./product-add-variant.types";

export const EMPTY_PRODUCT_VARIANT_KEY = "variant:empty";

export type SelectedCharacteristic = {
  attributeId: number;
  values: string[];
};

export type GenerateProductVariantsBaseValues = {
  price: number;
  quantity: number;
  status: ProductVariantUi["status"];
};

const DEFAULT_VARIANT_IN_STOCK = true;

export type GenerateProductVariantsParams = {
  selectedCharacteristics: SelectedCharacteristic[];
  availableFields: VariantCustomField[];
  base: GenerateProductVariantsBaseValues;
  previousVariants: ProductVariantUi[];
};

type CharacteristicDimension = {
  fieldId: number;
  fieldKey: string;
  fieldLabel: string;
  values: string[];
  sortOrder: number;
};

type FieldValuePair = {
  fieldId: number;
  value: string;
};

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
  availableFields: VariantCustomField[],
): CharacteristicDimension[] {
  const fieldsById = new Map(availableFields.map((field) => [field.id, field]));

  const dimensions = selectedCharacteristics.flatMap((characteristic) => {
    const field = fieldsById.get(characteristic.attributeId);
    const values = normalizeCharacteristicValues(characteristic.values ?? []);

    if (!field || values.length === 0) {
      return [];
    }

    return [
      {
        fieldId: field.id,
        fieldKey: field.key,
        fieldLabel: field.label,
        values,
        sortOrder: field.sortOrder,
      },
    ];
  });

  return dimensions.sort((left, right) => left.sortOrder - right.sortOrder);
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

/** Stable key from sorted `fieldId=value` segments (values trimmed). */
export function buildProductVariantKey(pairs: FieldValuePair[]): string {
  return [...pairs]
    .sort((left, right) => left.fieldId - right.fieldId)
    .map((pair) => `${pair.fieldId}=${pair.value.trim()}`)
    .join("|");
}

function buildVariantFromPairs(
  pairs: FieldValuePair[],
  dimensions: CharacteristicDimension[],
  base: GenerateProductVariantsBaseValues,
  previousByKey: Map<string, ProductVariantUi>,
): ProductVariantUi {
  const key = buildProductVariantKey(pairs);
  const previous = previousByKey.get(key);

  const customFields = pairs.map((pair) => {
    const dimension = dimensions.find((item) => item.fieldId === pair.fieldId);

    return {
      fieldId: pair.fieldId,
      fieldKey: dimension?.fieldKey ?? String(pair.fieldId),
      fieldLabel: dimension?.fieldLabel ?? String(pair.fieldId),
      value: pair.value,
    };
  });

  return {
    key,
    source: "generated",
    customFields,
    status: previous?.status ?? base.status,
    price: previous?.price ?? base.price,
    quantity: previous?.quantity ?? base.quantity,
    inStock: previous?.inStock ?? DEFAULT_VARIANT_IN_STOCK,
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
  availableFields,
  base,
  previousVariants,
}: GenerateProductVariantsParams): ProductVariantUi[] {
  const previousByKey = new Map(
    previousVariants.map((variant) => [variant.key, variant]),
  );
  const dimensions = resolveCharacteristicDimensions(
    selectedCharacteristics,
    availableFields,
  );

  if (dimensions.length === 0) {
    return [];
  }

  const valueCombinations = cartesianProduct(
    dimensions.map((dimension) =>
      dimension.values.map((value) => ({
        fieldId: dimension.fieldId,
        value,
      })),
    ),
  );

  return valueCombinations.map((pairs) =>
    buildVariantFromPairs(pairs, dimensions, base, previousByKey),
  );
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
