import type {
  CreateProductCustomFieldType,
  VariantCustomField,
} from "@/features/products/model/product-create-api.types";
import type { InstagramPostAiExtractionResponse } from "@/features/instagram/model/instagram.types";

import type {
  ProductAddCharacteristicRow,
  ProductAddFormValues,
  ProductAddSingleCharacteristicRow,
} from "../form/product-form.types";
import type { ProductType } from "../form/sections/product-type-section";
import type { CharacteristicFieldRef } from "../form/variants/product-add-variant.types";

type CategoryOption = {
  value: number;
  label: string;
};

type AiCharacteristicRow = {
  field: CharacteristicFieldRef;
  attributeId?: number;
  values: string[];
  fieldType: CreateProductCustomFieldType;
};

export type InstagramAiProductFormPatch = {
  formValues: Partial<ProductAddFormValues>;
  productType: ProductType;
};

const normalizeLabel = (value: string): string =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

const compactUniqueValues = (values: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawValue of values) {
    const value = rawValue.trim();
    const key = normalizeLabel(value);

    if (!value || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return result;
};

const newClientKey = (name: string, index: number): string =>
  `instagram-ai:${index}:${normalizeLabel(name).replace(/[^\w.-]+/g, "-")}`;

const mapAiFieldType = (
  type: string | undefined,
): CreateProductCustomFieldType => {
  const normalized = type?.trim().toLowerCase();
  return normalized === "text" ? "TEXT" : "OPTION";
};

const findVariantCustomField = (
  fieldId: number | undefined,
  variantCustomFields: readonly VariantCustomField[],
): VariantCustomField | undefined => {
  if (fieldId == null || !Number.isFinite(fieldId)) {
    return undefined;
  }

  return variantCustomFields.find((field) => field.id === fieldId);
};

const getResolvedFieldType = (
  fieldId: number | undefined,
  aiType: string | undefined,
  variantCustomFields: readonly VariantCustomField[],
): CreateProductCustomFieldType => {
  const existingField = findVariantCustomField(fieldId, variantCustomFields);

  if (existingField) {
    return existingField.type === "text" ? "TEXT" : "OPTION";
  }

  return mapAiFieldType(aiType);
};

const buildCharacteristicFieldRef = ({
  fieldId,
  fieldName,
  fieldType,
  index,
  variantCustomFields,
}: {
  fieldId?: number;
  fieldName: string;
  fieldType: CreateProductCustomFieldType;
  index: number;
  variantCustomFields: readonly VariantCustomField[];
}): CharacteristicFieldRef | null => {
  const existingField = findVariantCustomField(fieldId, variantCustomFields);

  if (existingField) {
    return {
      kind: "existing",
      id: existingField.id,
    };
  }

  const name = fieldName.trim();

  if (!name) {
    return null;
  }

  return {
    kind: "new",
    clientKey: newClientKey(name, index),
    name,
    type: fieldType,
  };
};

const buildAiCharacteristicRows = (
  extraction: InstagramPostAiExtractionResponse,
  variantCustomFields: readonly VariantCustomField[],
): AiCharacteristicRow[] => {
  const rows: AiCharacteristicRow[] = [];
  const matchedAttributeNames = new Set<string>();

  extraction.data.matchedFields.forEach((field, index) => {
    const fieldType = getResolvedFieldType(
      field.id,
      field.type,
      variantCustomFields,
    );
    const fieldName = field.name ?? field.attributeName;
    const values = compactUniqueValues(
      field.values.map((value) => value.optionName),
    );
    const fieldRef = buildCharacteristicFieldRef({
      fieldId: field.id,
      fieldName,
      fieldType,
      index,
      variantCustomFields,
    });

    matchedAttributeNames.add(normalizeLabel(field.attributeName));

    if (!fieldRef || values.length === 0) {
      return;
    }

    rows.push({
      field: fieldRef,
      attributeId: fieldRef.kind === "existing" ? fieldRef.id : undefined,
      values,
      fieldType,
    });
  });

  extraction.data.attributes.forEach((attribute, index) => {
    if (matchedAttributeNames.has(normalizeLabel(attribute.name))) {
      return;
    }

    const values = compactUniqueValues(attribute.values);
    const fieldRef = buildCharacteristicFieldRef({
      fieldName: attribute.name,
      fieldType: "OPTION",
      index: extraction.data.matchedFields.length + index,
      variantCustomFields,
    });

    if (!fieldRef || values.length === 0) {
      return;
    }

    rows.push({
      field: fieldRef,
      attributeId: fieldRef.kind === "existing" ? fieldRef.id : undefined,
      values,
      fieldType: "OPTION",
    });
  });

  return rows;
};

const resolveCategoryId = (
  extraction: InstagramPostAiExtractionResponse,
  categoryOptions: readonly CategoryOption[],
): number | undefined => {
  const categoryIds = new Set(categoryOptions.map((option) => option.value));

  for (const rawCategoryId of extraction.data.matchedCategoryIds) {
    const categoryId = Number(rawCategoryId);

    if (Number.isFinite(categoryId) && categoryIds.has(categoryId)) {
      return categoryId;
    }
  }

  return undefined;
};

const buildVariantCharacteristicRows = (
  rows: AiCharacteristicRow[],
): ProductAddCharacteristicRow[] =>
  rows.map((row) => ({
    field: row.field,
    attributeId: row.attributeId,
    ...(row.fieldType === "TEXT"
      ? { value: row.values[0] }
      : { values: row.values }),
  }));

const buildSingleCharacteristicRows = (
  rows: AiCharacteristicRow[],
): ProductAddSingleCharacteristicRow[] =>
  rows.flatMap((row) => {
    const value = row.values[0]?.trim();

    if (!value) {
      return [];
    }

    return [
      {
        field: row.field,
        attributeId: row.attributeId,
        value,
      },
    ];
  });

export const buildInstagramAiProductFormPatch = ({
  extraction,
  categoryOptions,
  variantCustomFields,
}: {
  extraction: InstagramPostAiExtractionResponse;
  categoryOptions: readonly CategoryOption[];
  variantCustomFields: readonly VariantCustomField[];
}): InstagramAiProductFormPatch => {
  const characteristicRows = buildAiCharacteristicRows(
    extraction,
    variantCustomFields,
  );
  const hasVariantDimensions = characteristicRows.some(
    (row) => row.values.length > 1,
  );
  const productType: ProductType = hasVariantDimensions ? "variants" : "single";
  const categoryId = resolveCategoryId(extraction, categoryOptions);

  const formValues: Partial<ProductAddFormValues> = {
    name: extraction.data.productName.trim(),
    description: extraction.data.productDescription.trim(),
    price: Number(extraction.data.price ?? 0),
    quantity: 1,
    ...(categoryId != null ? { categoryId } : {}),
    characteristics:
      productType === "variants"
        ? buildVariantCharacteristicRows(characteristicRows)
        : [],
    singleCharacteristics:
      productType === "single"
        ? buildSingleCharacteristicRows(characteristicRows)
        : [],
    variants: [],
  };

  return {
    formValues,
    productType,
  };
};
