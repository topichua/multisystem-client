import type {
  ProductDetails,
  ProductMediaItem,
  ProductVariant,
  ProductVariantCustomField,
} from "@/features/products/model/product.types";
import type { ProductAddFormValues } from "../product-form.types";
import type {
  CharacteristicFieldRef,
  ProductCharacteristicFormRow,
  ProductVariantUi,
  SingleProductCharacteristicFormRow,
  UploadedProductMedia,
  VariantMediaItem,
} from "../variants/product-add-variant.types";
import { buildProductVariantKey } from "../variants/generate-product-variants";
import { mapResponseFieldTypeToCreateFieldType } from "../variants/product-add-variant.utils";

export type ProductDetailFormState = {
  formValues: ProductAddFormValues;
  productType: "single" | "variants";
  productMedia: UploadedProductMedia[];
  variants: ProductVariantUi[];
  excludedVariantKeys: string[];
};

function mediaItemToSrc(media: ProductMediaItem): string {
  return media.url || media.sourceUrl || "";
}

function mediaItemToUploadId(media: ProductMediaItem): number {
  return media.uploadMediaId ?? media.id;
}

function mapProductMedia(media: ProductMediaItem[]): UploadedProductMedia[] {
  const seenIds = new Set<number>();

  return media.flatMap((item) => {
    const src = mediaItemToSrc(item);
    const id = mediaItemToUploadId(item);

    if (!src || seenIds.has(id)) {
      return [];
    }

    seenIds.add(id);
    return [{ id, src }];
  });
}

function mapVariantMedia(
  media: ProductMediaItem[],
  productMediaIds: ReadonlySet<number>,
): VariantMediaItem[] {
  const seenIds = new Set<number>();

  return media.flatMap((item) => {
    const src = mediaItemToSrc(item);
    const id = mediaItemToUploadId(item);

    if (!src || seenIds.has(id)) {
      return [];
    }

    seenIds.add(id);
    return [
      {
        id,
        src,
        origin: productMediaIds.has(id) ? "product" : "variant",
      },
    ];
  });
}

function mapCustomFieldRef(
  field: ProductVariantCustomField,
): CharacteristicFieldRef {
  return {
    kind: "existing",
    id: field.fieldId,
  };
}

function mapVariantCustomField(field: ProductVariantCustomField) {
  const fieldType = mapResponseFieldTypeToCreateFieldType(
    field.type === "text" ? "text" : "options",
  );

  return {
    fieldId: field.fieldId,
    field: mapCustomFieldRef(field),
    fieldKey: field.key,
    fieldLabel: field.label,
    fieldType,
    value: field.value,
    order: field.order,
  };
}

function buildVariantKey(variant: ProductVariant): string {
  const optionPairs = (variant.customFields ?? [])
    .filter((field) => field.type !== "text")
    .map((field) => ({
      field: mapCustomFieldRef(field),
      fieldStableKey: `existing:${field.fieldId}`,
      value: field.value,
    }));

  return optionPairs.length > 0
    ? buildProductVariantKey(optionPairs)
    : `existing:${variant.id}`;
}

function mapProductVariant(
  variant: ProductVariant,
  productType: "single" | "variants",
  productMediaIds: ReadonlySet<number>,
): ProductVariantUi {
  const hasOptionFields = (variant.customFields ?? []).some(
    (field) => field.type !== "text",
  );

  return {
    id: variant.id,
    key: buildVariantKey(variant),
    source:
      productType === "variants" && hasOptionFields ? "generated" : "manual",
    customFields: (variant.customFields ?? []).map(mapVariantCustomField),
    status: variant.status ?? "draft",
    price: Number(variant.price ?? 0),
    inStock: variant.inStock ?? true,
    quantity: Number(variant.quantity ?? 0),
    wishlistCount: variant.wishlistCount ?? 0,
    sku: variant.sku ?? "",
    media: mapVariantMedia(variant.media ?? [], productMediaIds),
  };
}

function buildSingleCharacteristics(
  variant: ProductVariant | undefined,
): SingleProductCharacteristicFormRow[] {
  return (variant?.customFields ?? []).map((field) => ({
    field: mapCustomFieldRef(field),
    attributeId: field.fieldId,
    value: field.value,
  }));
}

function buildVariantCharacteristics(
  variants: ProductVariant[],
): Array<ProductCharacteristicFormRow & { attributeId?: number }> {
  const byFieldId = new Map<
    number,
    ProductCharacteristicFormRow & {
      attributeId?: number;
      valueSet: Set<string>;
    }
  >();

  for (const variant of variants) {
    for (const field of variant.customFields ?? []) {
      const row =
        byFieldId.get(field.fieldId) ??
        ({
          field: mapCustomFieldRef(field),
          attributeId: field.fieldId,
          values: [],
          valueSet: new Set<string>(),
        } satisfies ProductCharacteristicFormRow & {
          attributeId?: number;
          valueSet: Set<string>;
        });

      const value = field.value.trim();
      if (value && !row.valueSet.has(value)) {
        row.valueSet.add(value);
        row.values = [...(row.values ?? []), value];
      }

      byFieldId.set(field.fieldId, row);
    }
  }

  return [...byFieldId.values()].map((item) => ({
    field: item.field,
    attributeId: item.attributeId,
    values: item.values,
  }));
}

function cartesianProduct<T>(dimensions: T[][]): T[][] {
  if (dimensions.length === 0) {
    return [];
  }

  return dimensions.reduce<T[][]>(
    (combinations, dimensionValues) =>
      combinations.flatMap((combination) =>
        dimensionValues.map((value) => [...combination, value]),
      ),
    [[]],
  );
}

function buildExcludedVariantKeys(variants: ProductVariant[]): string[] {
  const existingKeys = new Set(variants.map(buildVariantKey));
  const valuesByFieldId = new Map<number, Set<string>>();

  for (const variant of variants) {
    for (const field of variant.customFields ?? []) {
      if (field.type === "text") {
        continue;
      }

      const value = field.value.trim();
      if (!value) {
        continue;
      }

      const values = valuesByFieldId.get(field.fieldId) ?? new Set<string>();
      values.add(value);
      valuesByFieldId.set(field.fieldId, values);
    }
  }

  const dimensions = [...valuesByFieldId.entries()].map(([fieldId, values]) =>
    [...values].map((value) => ({
      field: { kind: "existing" as const, id: fieldId },
      fieldStableKey: `existing:${fieldId}`,
      value,
    })),
  );

  return cartesianProduct(dimensions)
    .map(buildProductVariantKey)
    .filter((key) => key && !existingKeys.has(key));
}

export function productDetailToProductForm(
  product: ProductDetails,
): ProductDetailFormState {
  const productType =
    product.productType === "variants" ? "variants" : "single";
  const productMediaIds = new Set(
    (product.media ?? []).map(mediaItemToUploadId),
  );
  const mappedVariants = product.variants.map((variant) =>
    mapProductVariant(variant, productType, productMediaIds),
  );
  const singleProductQuantity =
    productType === "single"
      ? Number(product.variants[0]?.quantity ?? product.quantity ?? 0)
      : Number(product.quantity ?? 0);

  return {
    productType,
    productMedia: mapProductMedia(product.media ?? []),
    variants: mappedVariants,
    excludedVariantKeys:
      productType === "variants"
        ? buildExcludedVariantKeys(product.variants)
        : [],
    formValues: {
      name: product.name,
      description: product.description ?? "",
      status:
        product.status === "active" || product.status === "archived"
          ? product.status
          : "draft",
      price: Number(product.price ?? 0),
      quantity: singleProductQuantity,
      categoryId: product.categoryId ?? undefined,
      weightGrams: product.weightGrams ?? undefined,
      lengthCm: product.lengthCm ?? undefined,
      widthCm: product.widthCm ?? undefined,
      heightCm: product.heightCm ?? undefined,
      characteristics:
        productType === "variants"
          ? buildVariantCharacteristics(product.variants)
          : [],
      singleCharacteristics:
        productType === "single"
          ? buildSingleCharacteristics(product.variants[0])
          : [],
      variants: [],
    },
  };
}
