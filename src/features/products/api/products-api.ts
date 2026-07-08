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
  ProductsListResponse,
  ProductsListSort,
} from "@/features/products/model/product.types";
import type { CreateProductInstagramReferencePayload } from "@/features/instagram/model/instagram.types";
import { PRODUCTS_DEFAULT_PAGE_SIZE } from "@/features/products/model/product.constants";
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
  status?: string | null;
};

function productsListQueryToRecord(
  params: ProductsListQueryParams,
): Record<string, string | number> {
  const out: Record<string, string | number> = {
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

  const status = params.status?.trim();
  if (status) {
    out.status = status;
  }

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

function normalizeProductsList(data: unknown): ProductsListResponse {
  if (!data || typeof data !== "object") {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: PRODUCTS_DEFAULT_PAGE_SIZE,
    };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items) ? (record.items as Product[]) : [];
  const total = typeof record.total === "number" ? record.total : items.length;
  const pageSize =
    typeof record.pageSize === "number"
      ? record.pageSize
      : typeof record.limit === "number"
        ? record.limit
        : PRODUCTS_DEFAULT_PAGE_SIZE;
  const page =
    typeof record.page === "number"
      ? record.page
      : typeof record.limit === "number" && record.limit > 0
        ? Math.floor(
            (typeof record.offset === "number" ? record.offset : 0) /
              record.limit,
          ) + 1
        : 1;

  return { items, total, page, pageSize };
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
};

function catalogVariantsListQueryToRecord(
  params: CatalogVariantsListQueryParams,
): Record<string, string | number> {
  const out: Record<string, string | number> = {
    keyword: params.keyword.trim(),
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
  };

  if (params.categoryIds?.length) {
    out.categoryIds = params.categoryIds.join(",");
  }

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
    await apiClient.delete(`${basePath}/${id}`);
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
