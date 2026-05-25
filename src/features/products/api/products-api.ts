import { apiClient } from '@/api/api-client';
import type {
  CatalogVariant,
  CatalogVariantsListResponse,
  Product,
  ProductCreatePayload,
  ProductDetails,
  ProductMediaCreatePayload,
  ProductMediaItem,
  ProductMediaUpdatePayload,
  ProductUpdatePayload,
  ProductVariantMediaItemPayload,
  ProductVariantMediaPutPayload,
  ProductVariant,
  ProductVariantCreatePayload,
  ProductVariantUpdatePayload,
  ProductsListResponse,
  ProductsListSort,
} from '@/features/products/model/product.types';

const basePath = '/products';

const appendVariantFormFields = (
  formData: FormData,
  payload: ProductVariantCreatePayload | ProductVariantUpdatePayload,
) => {
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
};

function productCreateUploadFieldName(): string {
  return import.meta.env.VITE_PRODUCT_CREATE_FILE_FIELD?.trim() || 'mainImage';
}

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
    out.categoryIds = params.categoryIds.join(',');
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

function normalizeMediaArray(data: unknown): ProductMediaItem[] {
  return Array.isArray(data) ? (data as ProductMediaItem[]) : [];
}

function normalizeCatalogVariantsList(data: unknown): CatalogVariantsListResponse {
  if (!data || typeof data !== 'object') {
    return { items: [], total: 0, page: 1, pageSize: 50 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items) ? (record.items as CatalogVariant[]) : [];
  const total = typeof record.total === 'number' ? record.total : items.length;
  const pageSize = typeof record.pageSize === 'number' ? record.pageSize : 50;
  const page = typeof record.page === 'number' ? record.page : 1;

  return { items, total, page, pageSize };
}

function normalizeProductsList(data: unknown): ProductsListResponse {
  if (!data || typeof data !== 'object') {
    return { items: [], total: 0, page: 1, pageSize: 10 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items) ? (record.items as Product[]) : [];
  const total = typeof record.total === 'number' ? record.total : items.length;
  const pageSize =
    typeof record.pageSize === 'number'
      ? record.pageSize
      : typeof record.limit === 'number'
        ? record.limit
        : 10;
  const page =
    typeof record.page === 'number'
      ? record.page
      : typeof record.limit === 'number' && record.limit > 0
        ? Math.floor((typeof record.offset === 'number' ? record.offset : 0) / record.limit) + 1
        : 1;

  return { items, total, page, pageSize };
}

function appendProductCreateFormFields(formData: FormData, payload: ProductCreatePayload): void {
  formData.append('name', payload.name);
  formData.append('description', payload.description ?? '');
  formData.append('status', payload.status);
  formData.append('sourceType', payload.sourceType);
  formData.append('sourceId', payload.sourceId ?? '');
  formData.append('referenceGroupId', payload.referenceGroupId ?? '');
  formData.append('price', String(payload.price));
  formData.append('currency', payload.currency);
  formData.append('inStock', String(payload.inStock));
  formData.append('quantity', String(payload.quantity));
  formData.append('mainImageUrl', payload.mainImageUrl ?? '');
  formData.append('categoryId', String(payload.categoryId));
}

function appendProductUpdateFormFields(formData: FormData, payload: ProductUpdatePayload): void {
  for (const [key, raw] of Object.entries(payload)) {
    if (raw === undefined) {
      continue;
    }
    if (raw === null) {
      formData.append(key, '');
    } else if (typeof raw === 'boolean') {
      formData.append(key, String(raw));
    } else if (typeof raw === 'number') {
      formData.append(key, String(raw));
    } else {
      formData.append(key, raw);
    }
  }
}

function axiosMultipartFormDataConfig() {
  return {
    transformRequest: [
      (body: unknown, headers: object) => {
        if (body instanceof FormData && headers) {
          if (typeof (headers as { delete?: (name: string) => void }).delete === 'function') {
            (headers as { delete: (name: string) => void }).delete('Content-Type');
          } else {
            delete (headers as Record<string, unknown>)['Content-Type'];
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
    const { data } = await apiClient.get<unknown>(`${basePath}/catalog-variants`, {
      params: {
        keyword,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
      },
    });

    return normalizeCatalogVariantsList(data);
  },

  list: async (params: ProductsListQueryParams): Promise<ProductsListResponse> => {
    const { data } = await apiClient.get<unknown>(basePath, {
      params: productsListQueryToRecord(params),
    });

    return normalizeProductsList(data);
  },

  create: async (payload: ProductCreatePayload, coverImage?: File | null): Promise<Product> => {
    const formData = new FormData();
    appendProductCreateFormFields(formData, payload);
    if (coverImage) {
      formData.append(productCreateUploadFieldName(), coverImage, coverImage.name);
    }

    const { data } = await apiClient.post<Product>(
      basePath,
      formData,
      axiosMultipartFormDataConfig(),
    );

    return data;
  },

  getById: async (id: number): Promise<ProductDetails> => {
    const { data } = await apiClient.get<ProductDetails>(`${basePath}/${id}`);

    return data;
  },

  update: async (
    id: number,
    payload: ProductUpdatePayload,
    coverImage?: File | null,
  ): Promise<ProductDetails> => {
    const formData = new FormData();
    appendProductUpdateFormFields(formData, payload);
    if (coverImage) {
      formData.append(productCreateUploadFieldName(), coverImage, coverImage.name);
    }

    const { data } = await apiClient.patch<ProductDetails>(
      `${basePath}/${id}`,
      formData,
      axiosMultipartFormDataConfig(),
    );

    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}`);
  },

  createVariant: async (
    productId: number,
    payload: ProductVariantCreatePayload,
    imageFile?: File | null,
  ): Promise<ProductVariant | undefined> => {
    if (imageFile) {
      const formData = new FormData();

      appendVariantFormFields(formData, payload);
      formData.append('image', imageFile, imageFile.name);

      const { data } = await apiClient.post<ProductVariant>(
        `${basePath}/${productId}/variants`,
        formData,
      );

      return data ?? undefined;
    }

    const { data } = await apiClient.post<ProductVariant>(
      `${basePath}/${productId}/variants`,
      payload,
    );

    return data ?? undefined;
  },

  updateVariant: async (
    productId: number,
    variantId: number,
    payload: ProductVariantUpdatePayload,
  ): Promise<void> => {
    await apiClient.patch(`${basePath}/${productId}/variants/${variantId}`, payload);
  },

  deleteVariant: async (productId: number, variantId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${productId}/variants/${variantId}`);
  },

  listMedia: async (productId: number): Promise<ProductMediaItem[]> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/${productId}/media`);

    return normalizeMediaArray(data);
  },

  listMediaEffective: async (
    productId: number,
    variantId?: number,
  ): Promise<ProductMediaItem[]> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/${productId}/media/effective`, {
      params: variantId != null ? { variantId } : undefined,
    });

    return normalizeMediaArray(data);
  },

  listVariantMedia: async (productId: number, variantId: number): Promise<ProductMediaItem[]> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/${productId}/variants/${variantId}/media`,
    );

    return normalizeMediaArray(data);
  },

  createMedia: async (productId: number, payload: ProductMediaCreatePayload): Promise<void> => {
    const body: Record<string, unknown> = {
      url: payload.url,
      type: payload.type,
      sortOrder: payload.sortOrder,
    };
    if (payload.sourceUrl) {
      body.sourceUrl = payload.sourceUrl;
    }
    if (payload.variantId != null && payload.variantId >= 1) {
      body.variantId = payload.variantId;
    }

    await apiClient.post(`${basePath}/${productId}/media`, body);
  },

  putVariantMedia: async (
    productId: number,
    variantId: number,
    payload: ProductVariantMediaItemPayload | ProductVariantMediaPutPayload,
  ): Promise<void> => {
    const body: ProductVariantMediaPutPayload = 'items' in payload ? payload : { items: [payload] };
    await apiClient.put(`${basePath}/${productId}/variants/${variantId}/media`, body);
  },

  updateMedia: async (
    productId: number,
    mediaId: number,
    payload: ProductMediaUpdatePayload,
  ): Promise<void> => {
    await apiClient.patch(`${basePath}/${productId}/media/${mediaId}`, payload);
  },

  deleteMedia: async (productId: number, mediaId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${productId}/media/${mediaId}`);
  },

  uploadProductMedia: async (productId: number, image: File, sortOrder?: number): Promise<void> => {
    const formData = new FormData();

    formData.append('image', image);

    if (sortOrder != null) {
      formData.append('sortOrder', String(sortOrder));
    }

    await apiClient.post(`${basePath}/${productId}/media`, formData);
  },
};
