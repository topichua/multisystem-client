import { apiClient } from "@/api/api-client";

import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from "@/features/categories/model/category.types";
import {
  normalizeCategories,
  normalizeCategory,
  type CategoryApiResponse,
} from "@/features/categories/model/normalize-category";

const basePath = "/categories";

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<CategoryApiResponse[]>(basePath);

    return normalizeCategories(data);
  },

  create: async (payload: CategoryCreatePayload): Promise<Category> => {
    const { data } = await apiClient.post<CategoryApiResponse>(basePath, {
      ...payload,
      sortOrder: 0,
    });

    return normalizeCategory(data);
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await apiClient.get<CategoryApiResponse>(
      `${basePath}/${id}`,
    );

    return normalizeCategory(data);
  },

  update: async (
    id: number,
    payload: CategoryUpdatePayload,
  ): Promise<Category> => {
    const { data } = await apiClient.patch<CategoryApiResponse>(
      `${basePath}/${id}`,
      payload,
    );

    return normalizeCategory(data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`${basePath}/${id}`);
  },
};
