import { makeAutoObservable, runInAction } from "mobx";

import { characteristicsApi } from "@/features/characteristics/api/characteristics-api";
import { productsApi } from "@/features/products/api/products-api";
import type {
  CreateProductPayload,
  UpdateProductPayload,
  VariantCustomField,
} from "@/features/products/model/product-create-api.types";
import type {
  Product,
  ProductDetails,
  ProductsListSort,
} from "@/features/products/model/product.types";
import { PRODUCTS_DEFAULT_PAGE_SIZE } from "@/features/products/model/product.constants";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import {
  normalizeAppliedListKeyword,
  productsListAppliedUrlStateEquals,
  type ProductsListAppliedUrlState,
} from "@/features/products/model/products-list-url";
import {
  readStoredProductsListViewMode,
  writeStoredProductsListViewMode,
  type ProductsListViewMode,
} from "@/features/products/model/products-list-view-storage";

function snapshotFromStore(store: ProductsStore): ProductsListAppliedUrlState {
  return {
    keyword: store.listKeyword,
    sort: store.listSort,
    categoryIds: [...store.listCategoryIds],
    status: store.listStatus,
    minPrice: store.listMinPrice,
    maxPrice: store.listMaxPrice,
    page: store.page,
    pageSize: store.pageSize,
    view: store.listViewMode,
  };
}

export class ProductsStore {
  products: Product[] = [];
  total = 0;
  page = 1;
  pageSize = PRODUCTS_DEFAULT_PAGE_SIZE;
  activeProduct: ProductDetails | null = null;

  listKeyword = "";
  listSort: ProductsListSort = "created_desc";
  listCategoryIds: number[] = [];
  listStatus: string | null = null;
  listMinPrice: number | null = null;
  listMaxPrice: number | null = null;

  listViewMode: ProductsListViewMode = readStoredProductsListViewMode();

  draftCategoryIds: number[] = [];
  draftStatus: string | null = null;
  draftMinPrice: number | null = null;
  draftMaxPrice: number | null = null;

  listLoading = false;
  listError: string | null = null;
  deleteLoadingId: number | null = null;
  deleteLoadingVariantId: number | null = null;
  archiveLoadingId: number | null = null;
  archiveLoadingVariantId: number | null = null;
  detailLoading = false;

  variantCustomFields: VariantCustomField[] = [];
  variantCustomFieldsLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  get appliedUrlSnapshot(): ProductsListAppliedUrlState {
    return snapshotFromStore(this);
  }

  get appliedNonKeywordFilterCount(): number {
    let n = this.listCategoryIds.length;
    if (this.listStatus) {
      n += 1;
    }
    if (this.listMinPrice != null || this.listMaxPrice != null) {
      n += 1;
    }
    if (this.listSort !== "created_desc") {
      n += 1;
    }
    return n;
  }

  get currentPage(): number {
    return this.page;
  }

  assignListStateFromUrl(parsed: ProductsListAppliedUrlState): boolean {
    const next: ProductsListAppliedUrlState = {
      ...parsed,
      categoryIds: [...new Set(parsed.categoryIds)],
    };
    if (productsListAppliedUrlStateEquals(snapshotFromStore(this), next)) {
      return false;
    }
    runInAction(() => {
      this.listKeyword = normalizeAppliedListKeyword(next.keyword);
      this.listSort = next.sort;
      this.listCategoryIds = next.categoryIds;
      this.listStatus = next.status;
      this.listMinPrice = next.minPrice;
      this.listMaxPrice = next.maxPrice;
      this.page = next.page;
      this.pageSize = next.pageSize;
      this.listViewMode = next.view;
    });
    writeStoredProductsListViewMode(next.view);
    return true;
  }

  setListViewMode = (mode: ProductsListViewMode): void => {
    if (mode === this.listViewMode) {
      return;
    }
    runInAction(() => {
      this.listViewMode = mode;
    });
    writeStoredProductsListViewMode(mode);
  };

  syncFilterDraftFromApplied = (): void => {
    runInAction(() => {
      this.draftCategoryIds = [...this.listCategoryIds];
      this.draftStatus = this.listStatus;
      this.draftMinPrice = this.listMinPrice;
      this.draftMaxPrice = this.listMaxPrice;
    });
  };

  resetFilterDraft = (): void => {
    runInAction(() => {
      this.draftCategoryIds = [];
      this.draftStatus = null;
      this.draftMinPrice = null;
      this.draftMaxPrice = null;
    });
  };

  setDraftCategoryIds = (ids: number[]): void => {
    runInAction(() => {
      this.draftCategoryIds = ids;
    });
  };

  setDraftStatus = (status: string | null): void => {
    runInAction(() => {
      this.draftStatus = status;
    });
  };

  setDraftMinPrice = (value: number | null): void => {
    runInAction(() => {
      this.draftMinPrice = value;
    });
  };

  setDraftMaxPrice = (value: number | null): void => {
    runInAction(() => {
      this.draftMaxPrice = value;
    });
  };

  applyFiltersFromPanel = (): void => {
    runInAction(() => {
      this.listCategoryIds = [...new Set(this.draftCategoryIds)];
      this.listStatus = this.draftStatus;
      this.listMinPrice = this.draftMinPrice;
      this.listMaxPrice = this.draftMaxPrice;
      this.page = 1;
    });
  };

  setListKeyword = (value: string): void => {
    const applied = normalizeAppliedListKeyword(value);
    if (applied === this.listKeyword) {
      return;
    }
    runInAction(() => {
      this.listKeyword = applied;
      this.page = 1;
    });
  };

  setListSort = (sort: ProductsListSort): void => {
    runInAction(() => {
      this.listSort = sort;
      this.page = 1;
    });
  };

  setListPage = (nextPage: number): void => {
    const safe = Math.max(1, nextPage);
    runInAction(() => {
      this.page = safe;
    });
  };

  removeListCategoryId = (id: number): void => {
    runInAction(() => {
      this.listCategoryIds = this.listCategoryIds.filter((c) => c !== id);
      this.page = 1;
    });
  };

  clearListStatus = (): void => {
    runInAction(() => {
      this.listStatus = null;
      this.page = 1;
    });
  };

  clearListPriceRange = (): void => {
    runInAction(() => {
      this.listMinPrice = null;
      this.listMaxPrice = null;
      this.page = 1;
    });
  };

  clearListKeyword = (): void => {
    runInAction(() => {
      this.listKeyword = "";
      this.page = 1;
    });
  };

  resetListSortToDefault = (): void => {
    runInAction(() => {
      this.listSort = "created_desc";
      this.page = 1;
    });
  };

  clearAllListFilters = (): void => {
    runInAction(() => {
      this.listKeyword = "";
      this.listSort = "created_desc";
      this.listCategoryIds = [];
      this.listStatus = null;
      this.listMinPrice = null;
      this.listMaxPrice = null;
      this.page = 1;
      this.pageSize = PRODUCTS_DEFAULT_PAGE_SIZE;
    });
  };

  private buildListQueryParams() {
    return {
      sort: this.listSort,
      page: this.page,
      pageSize: this.pageSize,
      ...(this.listKeyword ? { keyword: this.listKeyword } : {}),
      ...(this.listCategoryIds.length
        ? { categoryIds: this.listCategoryIds }
        : {}),
      ...(this.listStatus ? { status: this.listStatus } : {}),
      ...(this.listMinPrice != null ? { minPrice: this.listMinPrice } : {}),
      ...(this.listMaxPrice != null ? { maxPrice: this.listMaxPrice } : {}),
    };
  }

  loadProducts = async (options?: {
    page?: number;
    silent?: boolean;
  }): Promise<void> => {
    const silent = options?.silent === true;
    if (options?.page != null) {
      runInAction(() => {
        this.page = Math.max(1, options.page!);
      });
    }

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const result = await productsApi.list(this.buildListQueryParams());

      runInAction(() => {
        this.products = result.items;
        this.total = result.total;
        this.page = result.page;
        this.pageSize = result.pageSize;
      });
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
      });
      throwLoadError("Failed to load products", e);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  createProduct = async (
    payload: CreateProductPayload,
  ): Promise<ProductDetails> => {
    const created = await productsApi.createProduct(payload);
    runInAction(() => {
      this.activeProduct = created;
    });
    await this.loadProducts({ silent: true });
    return created;
  };

  updateProduct = async (
    id: number,
    payload: UpdateProductPayload,
  ): Promise<ProductDetails> => {
    const updated = await productsApi.updateProduct(id, payload);
    runInAction(() => {
      this.activeProduct = updated;
    });

    await this.loadProducts({ silent: true });
    return updated;
  };

  deleteProduct = async (id: number): Promise<void> => {
    runInAction(() => {
      this.deleteLoadingId = id;
    });

    try {
      await productsApi.delete(id);

      runInAction(() => {
        if (this.activeProduct?.id === id) {
          this.activeProduct = null;
        }
      });

      await this.loadProducts({ silent: true });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };

  deleteVariant = async (
    productId: number,
    variantId: number,
  ): Promise<void> => {
    await this.runVariantMutation(variantId, async () => {
      await productsApi.hardDeleteVariant(productId, variantId);
      await this.refreshAfterProductMutation(productId);
    });
  };

  archiveProduct = async (id: number): Promise<void> => {
    await this.runProductArchiveMutation(id, () => productsApi.archive(id));
  };

  unarchiveProduct = async (id: number): Promise<void> => {
    await this.runProductArchiveMutation(id, () => productsApi.unarchive(id));
  };

  archiveVariant = async (
    productId: number,
    variantId: number,
  ): Promise<void> => {
    await this.runVariantMutation(
      variantId,
      async () => {
        await productsApi.archiveVariant(productId, variantId);
        await this.refreshAfterProductMutation(productId);
      },
      "archive",
    );
  };

  unarchiveVariant = async (
    productId: number,
    variantId: number,
  ): Promise<void> => {
    await this.runVariantMutation(
      variantId,
      async () => {
        await productsApi.unarchiveVariant(productId, variantId);
        await this.refreshAfterProductMutation(productId);
      },
      "archive",
    );
  };

  private runProductArchiveMutation = async (
    id: number,
    mutate: () => Promise<void>,
  ): Promise<void> => {
    runInAction(() => {
      this.archiveLoadingId = id;
    });

    try {
      await mutate();
      await this.refreshAfterProductMutation(id);
    } finally {
      runInAction(() => {
        this.archiveLoadingId = null;
      });
    }
  };

  private runVariantMutation = async (
    variantId: number,
    mutate: () => Promise<void>,
    kind: "delete" | "archive" = "delete",
  ): Promise<void> => {
    runInAction(() => {
      if (kind === "archive") {
        this.archiveLoadingVariantId = variantId;
      } else {
        this.deleteLoadingVariantId = variantId;
      }
    });

    try {
      await mutate();
    } finally {
      runInAction(() => {
        if (kind === "archive") {
          this.archiveLoadingVariantId = null;
        } else {
          this.deleteLoadingVariantId = null;
        }
      });
    }
  };

  private refreshAfterProductMutation = async (
    productId: number,
  ): Promise<void> => {
    await this.loadProducts({ silent: true });

    if (this.activeProduct?.id === productId) {
      await this.loadProductById(productId, { silent: true });
    }
  };

  loadProductById = async (
    id: number,
    options?: { silent?: boolean },
  ): Promise<ProductDetails> => {
    if (!options?.silent) {
      runInAction(() => {
        this.detailLoading = true;
      });
    }

    try {
      const data = await productsApi.getById(id);
      runInAction(() => {
        this.activeProduct = data;
      });
      return data;
    } catch (e) {
      throwLoadError(`Failed to load product ${id}`, e);
    } finally {
      if (!options?.silent) {
        runInAction(() => {
          this.detailLoading = false;
        });
      }
    }
  };

  clearActiveProduct = (): void => {
    runInAction(() => {
      this.activeProduct = null;
    });
  };

  loadVariantCustomFields = async (): Promise<void> => {
    runInAction(() => {
      this.variantCustomFieldsLoading = true;
    });

    try {
      const result = await characteristicsApi.list();

      runInAction(() => {
        this.variantCustomFields = [...result.items].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );
      });
    } catch (e) {
      runInAction(() => {
        this.variantCustomFields = [];
      });
      throwLoadError("Failed to load product variant custom fields", e);
    } finally {
      runInAction(() => {
        this.variantCustomFieldsLoading = false;
      });
    }
  };
  // Variant-related store methods removed — not used by the products list controller.
}
