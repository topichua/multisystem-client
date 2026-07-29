export type Category = {
  id: number;
  name: string;
  parentId: number | null;
  sortOrder: number;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  productCount: number;
  productVariantCount: number;
  children: Category[];
};

export type CategoriesListResponse = Category[];

export type CategoryCreatePayload = {
  name: string;
  parentId: number | null;
};

export type CategoryUpdatePayload = Partial<
  Pick<Category, "name" | "parentId" | "sortOrder">
>;

export type CategoryDeletePayload = {
  categoryId: number | null;
};
