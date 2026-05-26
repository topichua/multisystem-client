import { apiClient } from "@/api/api-client";

import type {
  CategoriesListResponse,
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from "@/features/categories/model/category.types";

const basePath = "/categories";

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<CategoriesListResponse>(basePath);

    return data;
  },

  create: async (payload: CategoryCreatePayload): Promise<Category> => {
    const { data } = await apiClient.post<Category>(basePath, {
      ...payload,
      sortOrder: 0,
    });

    return data;
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`${basePath}/${id}`);

    return data;
  },

  update: async (
    id: number,
    payload: CategoryUpdatePayload,
  ): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(
      `${basePath}/${id}`,
      payload,
    );

    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`${basePath}/${id}`);
  },
};
