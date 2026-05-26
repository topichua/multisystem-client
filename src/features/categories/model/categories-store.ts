import { makeAutoObservable, runInAction } from "mobx";

import { categoriesApi } from "@/features/categories/api/categories-api";

import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from "@/features/categories/model/category.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

export class CategoriesStore {
  categories: Category[] = [];
  activeCategory: Category | null = null;

  listLoading = false;
  listError: string | null = null;

  detailLoading = false;
  detailError: string | null = null;

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
        this.listError = null;
      });
    }

    try {
      const data = await categoriesApi.list();
      runInAction(() => {
        this.categories = data;
      });
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
      });
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  loadCategoryById = async (id: number): Promise<void> => {
    runInAction(() => {
      this.detailLoading = true;
      this.detailError = null;
    });

    try {
      const data = await categoriesApi.getById(id);
      runInAction(() => {
        this.activeCategory = data;
      });
    } catch (e) {
      runInAction(() => {
        this.detailError = unknownErrorMessage(e);
      });
    } finally {
      runInAction(() => {
        this.detailLoading = false;
      });
    }
  };

  createCategory = async (payload: CategoryCreatePayload): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const createdCategory = await categoriesApi.create(payload);
      runInAction(() => {
        this.activeCategory = createdCategory;
      });
      await this.loadCategories({ silent: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateCategory = async (
    id: number,
    payload: CategoryUpdatePayload,
  ): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const updatedCategory = await categoriesApi.update(id, payload);
      runInAction(() => {
        this.activeCategory = updatedCategory;
      });
      await this.loadCategories({ silent: true });
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
