import { apiClient } from "@/api/api-client";
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
  ProductsListResponse,
  ProductsListSort,
} from "@/features/products/model/product.types";
import type { CreateProductInstagramReferencePayload } from "@/features/instagram/model/instagram.types";
import { PRODUCTS_DEFAULT_PAGE_SIZE } from "@/features/products/model/product.constants";

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

function normalizeCatalogVariantsList(
  data: unknown,
): CatalogVariantsListResponse {
  if (!data || typeof data !== "object") {
    return { items: [], total: 0, page: 1, pageSize: 50 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? (record.items as CatalogVariant[])
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
  page?: number;
  pageSize?: number;
};

export const productsApi = {
  listCatalogVariants: async (
    params: CatalogVariantsListQueryParams,
  ): Promise<CatalogVariantsListResponse> => {
    const keyword = params.keyword.trim();
    const { data } = await apiClient.get<unknown>(
      `${basePath}/catalog-variants`,
      {
        params: {
          keyword,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 50,
        },
      },
    );

    return normalizeCatalogVariantsList(data);
  },

  list: async (
    params: ProductsListQueryParams,
  ): Promise<ProductsListResponse> => {
    const { data } = await apiClient.get<unknown>(basePath, {
      params: productsListQueryToRecord(params),
    });

    return normalizeProductsList(data);
  },

  getById: async (id: number): Promise<ProductDetails> => {
    const { data } = await apiClient.get<ProductDetails>(`${basePath}/${id}`);

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
