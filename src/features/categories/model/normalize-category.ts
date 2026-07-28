import type { Category } from "@/features/categories/model/category.types";

export type CategoryApiResponse = {
  id: number;
  name: string;
  parentId: number | null;
  sortOrder: number;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  productsCount?: number;
  productVariantCount?: number;
  productVariantsCount?: number;
  children?: CategoryApiResponse[];
  subcategories?: CategoryApiResponse[];
};

export const normalizeCategory = (raw: CategoryApiResponse): Category => ({
  id: raw.id,
  name: raw.name,
  parentId: raw.parentId,
  sortOrder: raw.sortOrder,
  createdByUserId: raw.createdByUserId,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
  productCount: raw.productCount ?? raw.productsCount ?? 0,
  productVariantCount: raw.productVariantCount ?? raw.productVariantsCount ?? 0,
  children: (raw.subcategories ?? raw.children ?? []).map(normalizeCategory),
});

export const normalizeCategories = (items: CategoryApiResponse[]): Category[] =>
  items.map(normalizeCategory);
