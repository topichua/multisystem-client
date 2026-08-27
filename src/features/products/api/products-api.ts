import { apiClient } from "@/api/api-client";
import { asBoolean, asNumber, asRecord, asString } from "@/api/record-parsing";
import type {
  CreateProductPayload,
  ProductUploadedMedia,
  UpdateProductPayload,
  UploadedProductMediaResponse,
} from "@/features/products/model/product-create-api.types";
import type {
  CatalogVariant,
  CatalogVariantsListResponse,
  Product,
  ProductDetails,
  ProductInventoryResponse,
  ProductMediaItem,
  ProductVariant,
  ProductVariantCustomField,
  ProductsListResponse,
  ProductsListSort,
} from "@/features/products/model/product.types";
import type { CreateProductInstagramReferencePayload } from "@/features/instagram/model/instagram.types";
import { PRODUCTS_DEFAULT_PAGE_SIZE } from "@/features/products/model/product.constants";
import {
  applyCustomFieldFiltersToQueryRecord,
  type ProductsListCustomFieldFilter,
} from "@/features/products/model/products-list-custom-field-filters";
import { buildCatalogVariantLabelFromParts } from "@/features/products/utils/catalog-variant-display";

const basePath = "/products";

export const PRODUCT_MEDIA_UPLOAD_FIELD_NAME = "image";

export type ProductsListQueryParams = {
  sort: ProductsListSort;
  page: number;
  pageSize: number;
  keyword?: string;
  categoryIds?: number[];
  minPrice?: number | null;
  maxPrice?: number | null;
  byStatus?: string | null;
  quantityFrom?: number | null;
  quantityTo?: number | null;
  wishlistOnly?: boolean;
  showOnlyReserved?: boolean;
  customFieldFilters?: ProductsListCustomFieldFilter[];
};

function productsListQueryToRecord(
  params: ProductsListQueryParams,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize,
  };

  const keyword = params.keyword?.trim();
  if (keyword) {
    out.keyword = keyword;
  }

  if (params.categoryIds?.length) {
    out.categoryIds = params.categoryIds.join(",");
  }

  if (params.minPrice != null && !Number.isNaN(params.minPrice)) {
    out.minPrice = params.minPrice;
  }
  if (params.maxPrice != null && !Number.isNaN(params.maxPrice)) {
    out.maxPrice = params.maxPrice;
  }

  const byStatus = params.byStatus?.trim();
  if (byStatus && byStatus !== "all") {
    out.byStatus = byStatus;
  }

  if (params.quantityFrom != null && !Number.isNaN(params.quantityFrom)) {
    out.quantityFrom = params.quantityFrom;
  }
  if (params.quantityTo != null && !Number.isNaN(params.quantityTo)) {
    out.quantityTo = params.quantityTo;
  }

  if (params.wishlistOnly === true) {
    out.wishlistOnly = true;
  }
  if (params.showOnlyReserved === true) {
    out.showOnlyReserved = true;
  }

  applyCustomFieldFiltersToQueryRecord(out, params.customFieldFilters);

  return out;
}

function getCustomFieldValue(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const customFields = record.customFields;
  if (!Array.isArray(customFields)) {
    return null;
  }

  for (const customField of customFields) {
    const field = asRecord(customField);
    if (asString(field.key) === key) {
      return asString(field.value);
    }
  }

  return null;
}

function normalizeCatalogVariant(raw: unknown): CatalogVariant {
  const record = asRecord(raw);
  const product = asRecord(record.product);
  const productId = asNumber(record.productId) ?? asNumber(product.id) ?? 0;
  const productName = asString(product.name) ?? asString(record.name) ?? "";
  const unitPrice = asNumber(record.unitPrice) ?? asNumber(product.price) ?? 0;
  const quantity = asNumber(record.quantity) ?? 0;
  const inStock = asBoolean(record.inStock) ?? quantity > 0;
  const color = getCustomFieldValue(record, "color");
  const size = getCustomFieldValue(record, "size");
  const sku = asString(record.sku);
  const variantId = asNumber(record.id) ?? 0;
  const customFields = Array.isArray(record.customFields)
    ? record.customFields.map(normalizeProductVariantCustomField)
    : [];
  const label =
    asString(record.label) ??
    buildCatalogVariantLabelFromParts(productName, { color, size, sku });

  return {
    id: variantId,
    productId,
    color,
    size,
    sku,
    customFields,
    unitPrice,
    imageUrl: asString(record.imageUrl),
    inStock,
    quantity,
    wishlistCount: asNumber(record.wishlistCount) ?? 0,
    status: asString(record.status) ?? "active",
    label: label || `#${variantId}`,
    product: {
      id: productId,
      name: productName,
      categoryId: asNumber(product.categoryId) ?? asNumber(record.categoryId),
      mainImageUrl: asString(product.mainImageUrl),
      currency:
        asString(product.currency) ?? asString(record.currency) ?? "UAH",
      status: asString(product.status) ?? "active",
      price: asNumber(product.price) ?? unitPrice,
    },
  };
}

function normalizeCatalogVariantsList(
  data: unknown,
): CatalogVariantsListResponse {
  const record = asRecord(data);
  const items = Array.isArray(record.items)
    ? record.items.map(normalizeCatalogVariant)
    : [];

  return {
    items,
    total: asNumber(record.total) ?? items.length,
    page: asNumber(record.page) ?? 1,
    pageSize: asNumber(record.pageSize) ?? 50,
  };
}

function normalizeProductVariantCustomField(
  raw: unknown,
): ProductVariantCustomField {
  const record = asRecord(raw);

  return {
    fieldId: asNumber(record.fieldId) ?? 0,
    key: asString(record.key) ?? "",
    label: asString(record.label) ?? "",
    type: asString(record.type) ?? "text",
    value: asString(record.value) ?? "",
    order: asNumber(record.order) ?? 0,
  };
}

function normalizeProductMediaItem(raw: unknown): ProductMediaItem {
  const record = asRecord(raw);

  return {
    id: asNumber(record.id) ?? 0,
    uploadMediaId: asNumber(record.uploadMediaId),
    productId: asNumber(record.productId),
    url: asString(record.url) ?? "",
    type: asString(record.type),
    sourceUrl: asString(record.sourceUrl),
    sortOrder: asNumber(record.sortOrder),
    variantId: asNumber(record.variantId),
  };
}

function normalizeProductVariant(raw: unknown): ProductVariant {
  const record = asRecord(raw);
  const customFields = Array.isArray(record.customFields)
    ? record.customFields.map(normalizeProductVariantCustomField)
    : [];
  const media = Array.isArray(record.media)
    ? record.media.map(normalizeProductMediaItem)
    : [];

  return {
    id: asNumber(record.id) ?? 0,
    customFields,
    price: asNumber(record.price),
    inStock: asBoolean(record.inStock),
    quantity: asNumber(record.quantity),
    reservedQuantity: asNumber(record.reservedQuantity) ?? 0,
    availableQuantity: asNumber(record.availableQuantity) ?? 0,
    avgPurchasePrice: asNumber(record.avgPurchasePrice),
    wishlistCount: asNumber(record.wishlistCount) ?? 0,
    imageUrl: asString(record.imageUrl),
    sku: asString(record.sku),
    status: asString(record.status) ?? "active",
    createdAt: asString(record.createdAt) ?? "",
    updatedAt: asString(record.updatedAt) ?? "",
    media,
  };
}

export function normalizeProduct(raw: unknown): Product {
  const record = asRecord(raw);
  const variants = Array.isArray(record.variants)
    ? record.variants.map(normalizeProductVariant)
    : undefined;
  const sizes = record.sizes;

  return {
    id: asNumber(record.id) ?? 0,
    name: asString(record.name) ?? "",
    productType: asString(record.productType) ?? "single",
    description: asString(record.description),
    status: asString(record.status) ?? "active",
    price: asNumber(record.price),
    currency: asString(record.currency) ?? "UAH",
    inStock: asBoolean(record.inStock),
    quantity: asNumber(record.quantity),
    wishlistCount: asNumber(record.wishlistCount) ?? 0,
    mainImageUrl: asString(record.mainImageUrl),
    sourceType: asString(record.sourceType) ?? undefined,
    sourceId: asString(record.sourceId),
    referenceGroupId: asNumber(record.referenceGroupId),
    categoryId: asNumber(record.categoryId),
    weightGrams: asNumber(record.weightGrams),
    lengthCm: asNumber(record.lengthCm),
    widthCm: asNumber(record.widthCm),
    heightCm: asNumber(record.heightCm),
    createdAt: asString(record.createdAt) ?? "",
    updatedAt: asString(record.updatedAt) ?? "",
    sizes:
      typeof sizes === "string" || Array.isArray(sizes)
        ? (sizes as string | string[])
        : null,
    variants,
  };
}

function normalizeProductsList(data: unknown): ProductsListResponse {
  const record = asRecord(data);
  const items = Array.isArray(record.items)
    ? record.items.map(normalizeProduct)
    : [];
  const total = asNumber(record.total) ?? items.length;
  const pageSize =
    asNumber(record.pageSize) ??
    asNumber(record.limit) ??
    PRODUCTS_DEFAULT_PAGE_SIZE;
  const limit = asNumber(record.limit) ?? pageSize;
  const page = asNumber(record.page);
  const offset =
    asNumber(record.offset) ??
    (page != null && pageSize > 0 ? (page - 1) * pageSize : 0);

  return {
    items,
    total,
    page: page ?? (limit > 0 ? Math.floor(offset / limit) + 1 : 1),
    pageSize,
    limit,
    offset,
  };
}

function axiosMultipartFormDataConfig() {
  return {
    transformRequest: [
      (body: unknown, headers: object) => {
        if (body instanceof FormData && headers) {
          if (
            typeof (headers as { delete?: (name: string) => void }).delete ===
            "function"
          ) {
            (headers as { delete: (name: string) => void }).delete(
              "Content-Type",
            );
          } else {
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
        }
        return body;
      },
    ],
  };
}

export type CatalogVariantsListQueryParams = {
  keyword: string;
  categoryIds?: number[];
  page?: number;
  pageSize?: number;
  customFieldFilters?: ProductsListCustomFieldFilter[];
};

function catalogVariantsListQueryToRecord(
  params: CatalogVariantsListQueryParams,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {
    keyword: params.keyword.trim(),
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
  };

  if (params.categoryIds?.length) {
    out.categoryIds = params.categoryIds.join(",");
  }

  applyCustomFieldFiltersToQueryRecord(out, params.customFieldFilters);

  return out;
}

async function fetchCatalogVariants(
  path: string,
  params: CatalogVariantsListQueryParams,
): Promise<CatalogVariantsListResponse> {
  const { data } = await apiClient.get(path, {
    params: catalogVariantsListQueryToRecord(params),
  });

  return normalizeCatalogVariantsList(data);
}

export const productsApi = {
  listCatalogVariants: async (
    params: CatalogVariantsListQueryParams,
  ): Promise<CatalogVariantsListResponse> =>
    fetchCatalogVariants(`${basePath}/catalog-variants`, params),

  listProductVariants: async (
    params: CatalogVariantsListQueryParams,
  ): Promise<CatalogVariantsListResponse> =>
    fetchCatalogVariants("/products/variants", params),

  list: async (
    params: ProductsListQueryParams,
  ): Promise<ProductsListResponse> => {
    const { data } = await apiClient.get(basePath, {
      params: productsListQueryToRecord(params),
    });

    return normalizeProductsList(data);
  },

  getById: async (id: number): Promise<ProductDetails> => {
    const { data } = await apiClient.get<ProductDetails>(`${basePath}/${id}`);

    return data;
  },

  getInventory: async (id: number): Promise<ProductInventoryResponse> => {
    const { data } = await apiClient.get<ProductInventoryResponse>(
      `${basePath}/${id}/inventory`,
    );

    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}/hard`);
  },

  hardDeleteVariant: async (
    productId: number,
    variantId: number,
  ): Promise<void> => {
    await apiClient.delete(
      `${basePath}/${productId}/variants/${variantId}/hard`,
    );
  },

  archive: async (id: number): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/archive`);
  },

  unarchive: async (id: number): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/unarchive`);
  },

  archiveVariant: async (
    productId: number,
    variantId: number,
  ): Promise<void> => {
    await apiClient.post(
      `${basePath}/${productId}/variants/${variantId}/archive`,
    );
  },

  unarchiveVariant: async (
    productId: number,
    variantId: number,
  ): Promise<void> => {
    await apiClient.post(
      `${basePath}/${productId}/variants/${variantId}/unarchive`,
    );
  },

  uploadMedia: async (file: File): Promise<ProductUploadedMedia> => {
    const formData = new FormData();
    formData.append(PRODUCT_MEDIA_UPLOAD_FIELD_NAME, file, file.name);

    const { data } = await apiClient.post<UploadedProductMediaResponse>(
      `${basePath}/upload-media`,
      formData,
      axiosMultipartFormDataConfig(),
    );

    return {
      id: data.id,
      src: data.cdnUrl,
    };
  },

  createProduct: async (
    payload: CreateProductPayload,
  ): Promise<ProductDetails> => {
    const { data } = await apiClient.post<ProductDetails>(basePath, payload);

    return data;
  },

  updateProduct: async (
    id: number,
    payload: UpdateProductPayload,
  ): Promise<ProductDetails> => {
    const { data } = await apiClient.put<ProductDetails>(
      `${basePath}/${id}`,
      payload,
    );

    return data;
  },

  createInstagramReference: async (
    productId: number,
    payload: CreateProductInstagramReferencePayload,
  ): Promise<void> => {
    await apiClient.post(
      `${basePath}/${productId}/instagram-references`,
      payload,
    );
  },

  deleteInstagramReference: async (
    productId: number,
    referenceId: number | string,
  ): Promise<void> => {
    await apiClient.delete(
      `${basePath}/${productId}/instagram-references/${referenceId}`,
    );
  },
};
