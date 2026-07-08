export type ProductStatus = "draft" | "active" | "archived" | string;
export type ProductType = "single" | "variants" | string;

export type Product = {
  id: number;
  name: string;
  productType?: ProductType;
  description?: string | null;
  status: ProductStatus;
  price: number | null;
  currency: string;
  inStock: boolean | null;
  quantity: number | null;
  mainImageUrl: string | null;
  sourceType?: string;
  sourceId?: string | null;
  referenceGroupId?: number | null;
  categoryId: number | null;
  weightGrams?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  createdAt: string;
  updatedAt: string;
  sizes?: string[] | string | null;
  variants?: ProductVariant[];
};

export type ProductCategoryRef = {
  id: number;
  name: string;
  parentId: number | null;
};

export type ProductVariant = {
  id: number;
  customFields: ProductVariantCustomField[];
  color?: string | null;
  size?: string | null;
  price: number | null;
  inStock: boolean | null;
  quantity: number | null;
  imageUrl: string | null;
  sku: string | null;
  createdAt: string;
  updatedAt: string;
  status: ProductStatus;
  media: ProductMediaItem[];
};

export type ProductVariantCustomField = {
  fieldId: number;
  key: string;
  label: string;
  type: "options" | "text" | string;
  value: string;
  order: number;
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
  media: ProductMediaItem[];
  sourceReferences: ProductSourceReference[];
};

export type ProductInventoryVariant = {
  variantId: number;
  sku: string | null;
  name: string | null;
  price: number | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  stockQty: number;
  stockCostTotal: number;
  averagePurchasePrice: number | null;
  stockInitialized?: boolean;
  requiresInitialization?: boolean;
};

export type ProductInventoryResponse = {
  productId: number;
  variants: ProductInventoryVariant[];
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
  limit?: number;
  offset?: number;
};

export type CatalogVariantProduct = {
  id: number;
  name: string;
  categoryId: number | null;
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
  uploadMediaId?: number | null;
  productId?: number | null;
  url: string;
  type?: string | null;
  sourceUrl?: string | null;
  sortOrder?: number | null;
  variantId?: number | null;
};
