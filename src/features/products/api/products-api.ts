import { apiClient } from "@/api/api-client";
import {
  asRecord,
  getBoolean,
  getNestedRecord,
  getNumber,
  getString,
} from "@/api/record-parsing";
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
    if (getString(field, ["key"]) === key) {
      return getString(field, ["value"]);
    }
  }

  return null;
}

function normalizeCatalogVariant(raw: unknown): CatalogVariant {
  const record = asRecord(raw);
  const product = getNestedRecord(record, [
    "product",
    "productParent",
    "product_parent",
  ]);
  const productId =
    getNumber(record, ["productId", "product_id"]) ??
    getNumber(product, ["id"]) ??
    0;
  const productName =
    getString(product, ["name"]) ??
    getString(record, ["productName", "product_name"]) ??
    "";
  const unitPrice =
    getNumber(record, ["unitPrice", "unit_price", "price"]) ??
    getNumber(product, ["price"]) ??
    0;
  const quantity =
    getNumber(record, ["quantity", "availableQuantity", "stockQty"]) ?? 0;
  const inStock = getBoolean(record, ["inStock", "in_stock"]) ?? quantity > 0;
  const color =
    getString(record, ["color"]) ?? getCustomFieldValue(record, "color");
  const size =
    getString(record, ["size"]) ?? getCustomFieldValue(record, "size");
  const sku = getString(record, ["sku"]);
  const variantId = getNumber(record, ["id"]) ?? 0;
  const label =
    getString(record, ["label", "name"]) ??
    buildCatalogVariantLabelFromParts(productName, { color, size, sku });

  return {
    id: variantId,
    productId,
    color,
    size,
    sku,
    unitPrice,
    imageUrl:
      getString(record, ["imageUrl", "image_url"]) ??
      getString(record, ["variantImageUrl", "variant_image_url"]),
    inStock,
    quantity,
    wishlistCount: getNumber(record, ["wishlistCount", "wishlist_count"]) ?? 0,
    status: getString(record, ["status"]) ?? "active",
    label: label || `#${variantId}`,
    product: {
      id: productId,
      name: productName,
      categoryId:
        getNumber(product, ["categoryId", "category_id"]) ??
        getNumber(record, ["categoryId", "category_id"]),
      mainImageUrl:
        getString(product, ["mainImageUrl", "main_image_url"]) ??
        getString(record, ["productImageUrl", "product_image_url"]),
      currency:
        getString(product, ["currency"]) ??
        getString(record, ["currency"]) ??
        "UAH",
      status:
        getString(product, ["status"]) ??
        getString(record, ["productStatus", "product_status"]) ??
        "active",
      price: getNumber(product, ["price"]) ?? unitPrice,
    },
  };
}

function normalizeCatalogVariantsList(
  data: unknown,
): CatalogVariantsListResponse {
  if (!data || typeof data !== "object") {
    return { items: [], total: 0, page: 1, pageSize: 50 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? record.items.map(normalizeCatalogVariant)
    : [];
  const total = typeof record.total === "number" ? record.total : items.length;
  const pageSize = typeof record.pageSize === "number" ? record.pageSize : 50;
  const page = typeof record.page === "number" ? record.page : 1;

  return { items, total, page, pageSize };
}

function normalizeProductVariantCustomField(
  raw: unknown,
): ProductVariantCustomField {
  const record = asRecord(raw);

  return {
    fieldId: getNumber(record, ["fieldId", "field_id"]) ?? 0,
    key: getString(record, ["key"]) ?? "",
    label: getString(record, ["label"]) ?? "",
    type: getString(record, ["type"]) ?? "text",
    value: getString(record, ["value"]) ?? "",
    order: getNumber(record, ["order"]) ?? 0,
  };
}

function normalizeProductMediaItem(raw: unknown): ProductMediaItem {
  const record = asRecord(raw);

  return {
    id: getNumber(record, ["id"]) ?? 0,
    uploadMediaId: getNumber(record, ["uploadMediaId", "upload_media_id"]),
    productId: getNumber(record, ["productId", "product_id"]),
    url: getString(record, ["url"]) ?? "",
    type: getString(record, ["type"]),
    sourceUrl: getString(record, ["sourceUrl", "source_url"]),
    sortOrder: getNumber(record, ["sortOrder", "sort_order"]),
    variantId: getNumber(record, ["variantId", "variant_id"]),
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
    id: getNumber(record, ["id"]) ?? 0,
    customFields,
    price: getNumber(record, ["price"]),
    inStock: getBoolean(record, ["inStock", "in_stock"]),
    quantity: getNumber(record, ["quantity"]),
    reservedQuantity:
      getNumber(record, ["reservedQuantity", "reserved_quantity"]) ?? 0,
    availableQuantity:
      getNumber(record, ["availableQuantity", "available_quantity"]) ?? 0,
    avgPurchasePrice: getNumber(record, [
      "avgPurchasePrice",
      "avg_purchase_price",
      "averagePurchasePrice",
      "average_purchase_price",
    ]),
    wishlistCount: getNumber(record, ["wishlistCount", "wishlist_count"]) ?? 0,
    imageUrl: getString(record, ["imageUrl", "image_url"]),
    sku: getString(record, ["sku"]),
    status: getString(record, ["status"]) ?? "active",
    createdAt: getString(record, ["createdAt", "created_at"]) ?? "",
    updatedAt: getString(record, ["updatedAt", "updated_at"]) ?? "",
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
    id: getNumber(record, ["id"]) ?? 0,
    name: getString(record, ["name"]) ?? "",
    productType: getString(record, ["productType", "product_type"]) ?? "single",
    description: getString(record, ["description"]),
    status: getString(record, ["status"]) ?? "active",
    price: getNumber(record, ["price"]),
    currency: getString(record, ["currency"]) ?? "UAH",
    inStock: getBoolean(record, ["inStock", "in_stock"]),
    quantity: getNumber(record, ["quantity"]),
    wishlistCount: getNumber(record, ["wishlistCount", "wishlist_count"]) ?? 0,
    mainImageUrl: getString(record, ["mainImageUrl", "main_image_url"]),
    sourceType: getString(record, ["sourceType", "source_type"]) ?? undefined,
    sourceId: getString(record, ["sourceId", "source_id"]),
    referenceGroupId: getNumber(record, [
      "referenceGroupId",
      "reference_group_id",
    ]),
    categoryId: getNumber(record, ["categoryId", "category_id"]),
    weightGrams: getNumber(record, ["weightGrams", "weight_grams"]),
    lengthCm: getNumber(record, ["lengthCm", "length_cm"]),
    widthCm: getNumber(record, ["widthCm", "width_cm"]),
    heightCm: getNumber(record, ["heightCm", "height_cm"]),
    createdAt: getString(record, ["createdAt", "created_at"]) ?? "",
    updatedAt: getString(record, ["updatedAt", "updated_at"]) ?? "",
    sizes:
      typeof sizes === "string" || Array.isArray(sizes)
        ? (sizes as string | string[])
        : null,
    variants,
  };
}

function normalizeProductsList(data: unknown): ProductsListResponse {
  if (!data || typeof data !== "object") {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: PRODUCTS_DEFAULT_PAGE_SIZE,
      limit: PRODUCTS_DEFAULT_PAGE_SIZE,
      offset: 0,
    };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? record.items.map(normalizeProduct)
    : [];
  const total = typeof record.total === "number" ? record.total : items.length;
  const pageSize =
    typeof record.pageSize === "number"
      ? record.pageSize
      : typeof record.limit === "number"
        ? record.limit
        : PRODUCTS_DEFAULT_PAGE_SIZE;
  const limit = typeof record.limit === "number" ? record.limit : pageSize;
  const offset =
    typeof record.offset === "number"
      ? record.offset
      : typeof record.page === "number" && pageSize > 0
        ? (record.page - 1) * pageSize
        : 0;
  const page =
    typeof record.page === "number"
      ? record.page
      : limit > 0
        ? Math.floor(offset / limit) + 1
        : 1;

  return { items, total, page, pageSize, limit, offset };
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
