export type ProductStatus = "draft" | "active" | "archived" | string;

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  status: ProductStatus;
  price: number | null;
  currency: string;
  inStock: boolean | null;
  quantity: number | null;
  mainImageUrl: string | null;
  sourceType?: string;
  sourceId?: string | null;
  referenceGroupId: number | null;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  sizes?: string[] | string | null;
};

export type ProductCategoryRef = {
  id: number;
  name: string;
  parentId: number | null;
};

export type ProductVariant = {
  id: number;
  color: string | null;
  size: string | null;
  price: number | null;
  inStock: boolean | null;
  quantity: number | null;
  imageUrl: string | null;
  sku: string | null;
  createdAt: string;
  updatedAt: string;
  media: unknown[];
};

export type ProductSourceReference = {
  id: number;
  sourceType: string;
  sourceId: string;
  permalink: string | null;
  caption: string | null;
  createdAt: string;
};

export type ProductDetails = Product & {
  createdByUserId?: number | null;
  updatedByUserId?: number | null;
  category?: ProductCategoryRef | null;
  variants: ProductVariant[];
  media: unknown[];
  sourceReferences: ProductSourceReference[];
};

export const PRODUCTS_LIST_SORT_VALUES = [
  "created_desc",
  "created_asc",
  "name_asc",
  "name_desc",
  "price_asc",
  "price_desc",
] as const;

export type ProductsListSort = (typeof PRODUCTS_LIST_SORT_VALUES)[number];

export function parseProductsListSort(
  raw: string | null | undefined,
): ProductsListSort {
  if (raw && (PRODUCTS_LIST_SORT_VALUES as readonly string[]).includes(raw)) {
    return raw as ProductsListSort;
  }
  return "created_desc";
}

export type ProductsListResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type CatalogVariantProduct = {
  id: number;
  name: string;
  categoryId: number;
  mainImageUrl: string | null;
  currency: string;
  status: ProductStatus;
  price: number;
};

export type CatalogVariant = {
  id: number;
  productId: number;
  color: string | null;
  size: string | null;
  sku: string | null;
  unitPrice: number;
  imageUrl: string | null;
  inStock: boolean;
  quantity: number;
  status: ProductStatus;
  label: string;
  product: CatalogVariantProduct;
};

export type CatalogVariantsListResponse = {
  items: CatalogVariant[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductMediaItem = {
  id: number;
  url: string;
  type?: string | null;
  sourceUrl?: string | null;
  sortOrder?: number | null;
  variantId?: number | null;
};

export type ProductMediaCreatePayload = {
  url: string;
  type: string;
  sourceUrl?: string;
  sortOrder: number;
  variantId?: number;
};

export type ProductMediaUpdatePayload = Partial<{
  url: string;
  sourceUrl: string;
  sortOrder: number;
  type: string;
}>;

export type ProductVariantMediaItemPayload = {
  url: string;
  type: "image" | "video";
  sourceUrl?: string;
  sortOrder?: number;
};

export type ProductVariantMediaPutPayload = {
  items: ProductVariantMediaItemPayload[];
};

export type ProductCreatePayload = {
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  sourceType: "manual" | string;
  sourceId: string;
  referenceGroupId: string;
  price: number;
  currency: string;
  inStock: boolean;
  quantity: number;
  mainImageUrl: string;
  categoryId: number;
};

export type ProductUpdatePayload = Partial<{
  name: string;
  description: string | null;
  status: ProductStatus;
  sourceType: string;
  sourceId: string | null;
  referenceGroupId: string | null;
  price: number | null;
  currency: string;
  inStock: boolean | null;
  quantity: number | null;
  mainImageUrl: string | null;
  categoryId: number | null;
}>;

export type ProductVariantCreatePayload = {
  color: string;
  size: string;
  price: number;
  inStock: boolean;
  quantity: number;
  imageUrl: string;
  sku: string;
};

export type ProductVariantDraft = ProductVariantCreatePayload & {
  clientId: string;
  imageFile?: File | null;
};

export type ProductVariantUpdatePayload = Partial<{
  color: string | null;
  size: string | null;
  price: number | null;
  inStock: boolean | null;
  quantity: number | null;
  imageUrl: string | null;
  sku: string | null;
}>;
