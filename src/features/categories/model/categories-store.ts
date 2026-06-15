import { makeAutoObservable, runInAction } from "mobx";

import { categoriesApi } from "@/features/categories/api/categories-api";

import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from "@/features/categories/model/category.types";

export class CategoriesStore {
  categories: Category[] = [];
  activeCategory: Category | null = null;

  listLoading = false;

  detailLoading = false;

  saveLoading = false;
  deleteLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadCategories = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
      });
    }

    try {
      const data = await categoriesApi.list();
      runInAction(() => {
        this.categories = data;
      });
    } catch {
      runInAction(() => {
        this.categories = [];
      });
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  loadCategoryById = async (
    id: number,
    options?: { silent?: boolean },
  ): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.detailLoading = true;
      });
    }

    try {
      const data = await categoriesApi.getById(id);
      runInAction(() => {
        this.activeCategory = data;
      });
    } catch {
      runInAction(() => {
        this.activeCategory = null;
      });
    } finally {
      if (!silent) {
        runInAction(() => {
          this.detailLoading = false;
        });
      }
    }
  };

  createCategory = async (
    payload: CategoryCreatePayload,
  ): Promise<Category> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const createdCategory = await categoriesApi.create(payload);
      runInAction(() => {
        this.activeCategory = createdCategory;
      });
      await this.loadCategories({ silent: true });
      return createdCategory;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateCategory = async (
    id: number,
    payload: CategoryUpdatePayload,
  ): Promise<Category> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const updatedCategory = await categoriesApi.update(id, payload);
      runInAction(() => {
        this.activeCategory = updatedCategory;
      });
      await this.loadCategories({ silent: true });
      return updatedCategory;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  deleteCategory = async (id: number): Promise<void> => {
    runInAction(() => {
      this.deleteLoadingId = id;
    });

    try {
      await categoriesApi.delete(id);
      runInAction(() => {
        if (this.activeCategory?.id === id) {
          this.activeCategory = null;
        }
      });
      await this.loadCategories({ silent: true });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };
}
