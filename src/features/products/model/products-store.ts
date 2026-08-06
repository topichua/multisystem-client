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
  ProductsListByStatus,
  ProductsListSort,
} from "@/features/products/model/product.types";
import { PRODUCTS_LIST_BY_STATUS_DEFAULT } from "@/features/products/model/product.types";
import { PRODUCTS_DEFAULT_PAGE_SIZE } from "@/features/products/model/product.constants";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import {
  normalizeAppliedListKeyword,
  productsListAppliedUrlStateEquals,
  type ProductsListAppliedUrlState,
  type ProductsListCustomFieldFilter,
} from "@/features/products/model/products-list-url";
import {
  coerceCustomFieldFiltersToFields,
  normalizeCustomFieldFilters,
  upsertDraftCustomFieldFilter,
} from "@/features/products/model/products-list-custom-field-filters";
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
    byStatus: store.listByStatus,
    minPrice: store.listMinPrice,
    maxPrice: store.listMaxPrice,
    quantityFrom: store.listQuantityFrom,
    quantityTo: store.listQuantityTo,
    wishlistOnly: store.listWishlistOnly,
    showOnlyReserved: store.listShowOnlyReserved,
    customFieldFilters: normalizeCustomFieldFilters(
      store.listCustomFieldFilters,
    ),
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
  listByStatus: ProductsListByStatus = PRODUCTS_LIST_BY_STATUS_DEFAULT;
  listMinPrice: number | null = null;
  listMaxPrice: number | null = null;
  listQuantityFrom: number | null = null;
  listQuantityTo: number | null = null;
  listWishlistOnly = false;
  listShowOnlyReserved = false;
  listCustomFieldFilters: ProductsListCustomFieldFilter[] = [];

  listViewMode: ProductsListViewMode = readStoredProductsListViewMode();

  draftCategoryIds: number[] = [];
  draftByStatus: ProductsListByStatus = PRODUCTS_LIST_BY_STATUS_DEFAULT;
  draftMinPrice: number | null = null;
  draftMaxPrice: number | null = null;
  draftQuantityFrom: number | null = null;
  draftQuantityTo: number | null = null;
  draftWishlistOnly = false;
  draftShowOnlyReserved = false;
  draftCustomFieldFilters: ProductsListCustomFieldFilter[] = [];
  draftSelectedCustomFieldIds: number[] = [];

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
    if (this.listByStatus !== PRODUCTS_LIST_BY_STATUS_DEFAULT) {
      n += 1;
    }
    if (this.listMinPrice != null || this.listMaxPrice != null) {
      n += 1;
    }
    if (this.listQuantityFrom != null || this.listQuantityTo != null) {
      n += 1;
    }
    if (this.listWishlistOnly) {
      n += 1;
    }
    if (this.listShowOnlyReserved) {
      n += 1;
    }
    if (this.listSort !== "created_desc") {
      n += 1;
    }
    n += this.listCustomFieldFilters.length;
    return n;
  }

  get currentPage(): number {
    return this.page;
  }

  assignListStateFromUrl(parsed: ProductsListAppliedUrlState): boolean {
    const next: ProductsListAppliedUrlState = {
      ...parsed,
      categoryIds: [...new Set(parsed.categoryIds)],
      customFieldFilters: normalizeCustomFieldFilters(
        parsed.customFieldFilters,
      ),
    };
    if (productsListAppliedUrlStateEquals(snapshotFromStore(this), next)) {
      return false;
    }
    runInAction(() => {
      this.listKeyword = normalizeAppliedListKeyword(next.keyword);
      this.listSort = next.sort;
      this.listCategoryIds = next.categoryIds;
      this.listByStatus = next.byStatus;
      this.listMinPrice = next.minPrice;
      this.listMaxPrice = next.maxPrice;
      this.listQuantityFrom = next.quantityFrom;
      this.listQuantityTo = next.quantityTo;
      this.listWishlistOnly = next.wishlistOnly;
      this.listShowOnlyReserved = next.showOnlyReserved;
      this.listCustomFieldFilters = next.customFieldFilters;
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
      this.draftByStatus = this.listByStatus;
      this.draftMinPrice = this.listMinPrice;
      this.draftMaxPrice = this.listMaxPrice;
      this.draftQuantityFrom = this.listQuantityFrom;
      this.draftQuantityTo = this.listQuantityTo;
      this.draftWishlistOnly = this.listWishlistOnly;
      this.draftShowOnlyReserved = this.listShowOnlyReserved;
      this.draftCustomFieldFilters = normalizeCustomFieldFilters(
        this.listCustomFieldFilters,
      );
      this.draftSelectedCustomFieldIds = this.draftCustomFieldFilters.map(
        (filter) => filter.fieldId,
      );
    });
  };

  resetFilterDraft = (): void => {
    runInAction(() => {
      this.draftCategoryIds = [];
      this.draftByStatus = PRODUCTS_LIST_BY_STATUS_DEFAULT;
      this.draftMinPrice = null;
      this.draftMaxPrice = null;
      this.draftQuantityFrom = null;
      this.draftQuantityTo = null;
      this.draftWishlistOnly = false;
      this.draftShowOnlyReserved = false;
      this.draftCustomFieldFilters = [];
      this.draftSelectedCustomFieldIds = [];
    });
  };

  setDraftCategoryIds = (ids: number[]): void => {
    runInAction(() => {
      this.draftCategoryIds = ids;
    });
  };

  setDraftByStatus = (byStatus: ProductsListByStatus): void => {
    runInAction(() => {
      this.draftByStatus = byStatus;
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

  setDraftQuantityFrom = (value: number | null): void => {
    runInAction(() => {
      this.draftQuantityFrom = value;
    });
  };

  setDraftQuantityTo = (value: number | null): void => {
    runInAction(() => {
      this.draftQuantityTo = value;
    });
  };

  setDraftWishlistOnly = (value: boolean): void => {
    runInAction(() => {
      this.draftWishlistOnly = value;
    });
  };

  setDraftShowOnlyReserved = (value: boolean): void => {
    runInAction(() => {
      this.draftShowOnlyReserved = value;
    });
  };

  setDraftCustomFieldFilter = (
    fieldId: number,
    next: ProductsListCustomFieldFilter | null,
  ): void => {
    runInAction(() => {
      this.draftCustomFieldFilters = upsertDraftCustomFieldFilter(
        this.draftCustomFieldFilters,
        next,
        fieldId,
      );
      if (next != null && !this.draftSelectedCustomFieldIds.includes(fieldId)) {
        this.draftSelectedCustomFieldIds = [
          ...this.draftSelectedCustomFieldIds,
          fieldId,
        ].sort((a, b) => a - b);
      }
    });
  };

  setDraftSelectedCustomFieldIds = (ids: number[]): void => {
    runInAction(() => {
      const nextIds = [...new Set(ids)]
        .filter((id) => Number.isFinite(id) && id >= 1)
        .sort((a, b) => a - b);
      const selected = new Set(nextIds);
      this.draftSelectedCustomFieldIds = nextIds;
      this.draftCustomFieldFilters = this.draftCustomFieldFilters.filter(
        (filter) => selected.has(filter.fieldId),
      );
    });
  };

  applyFiltersFromPanel = (): void => {
    runInAction(() => {
      this.listCategoryIds = [...new Set(this.draftCategoryIds)];
      this.listByStatus = this.draftByStatus;
      this.listMinPrice = this.draftMinPrice;
      this.listMaxPrice = this.draftMaxPrice;
      this.listQuantityFrom = this.draftQuantityFrom;
      this.listQuantityTo = this.draftQuantityTo;
      this.listWishlistOnly = this.draftWishlistOnly;
      this.listShowOnlyReserved = this.draftShowOnlyReserved;
      this.listCustomFieldFilters = normalizeCustomFieldFilters(
        this.draftCustomFieldFilters,
      );
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

  clearListByStatus = (): void => {
    runInAction(() => {
      this.listByStatus = PRODUCTS_LIST_BY_STATUS_DEFAULT;
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

  clearListQuantityRange = (): void => {
    runInAction(() => {
      this.listQuantityFrom = null;
      this.listQuantityTo = null;
      this.page = 1;
    });
  };

  clearListWishlistOnly = (): void => {
    runInAction(() => {
      this.listWishlistOnly = false;
      this.page = 1;
    });
  };

  clearListShowOnlyReserved = (): void => {
    runInAction(() => {
      this.listShowOnlyReserved = false;
      this.page = 1;
    });
  };

  removeListCustomFieldFilter = (fieldId: number): void => {
    runInAction(() => {
      this.listCustomFieldFilters = this.listCustomFieldFilters.filter(
        (filter) => filter.fieldId !== fieldId,
      );
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
      this.listByStatus = PRODUCTS_LIST_BY_STATUS_DEFAULT;
      this.listMinPrice = null;
      this.listMaxPrice = null;
      this.listQuantityFrom = null;
      this.listQuantityTo = null;
      this.listWishlistOnly = false;
      this.listShowOnlyReserved = false;
      this.listCustomFieldFilters = [];
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
      ...(this.listByStatus !== PRODUCTS_LIST_BY_STATUS_DEFAULT
        ? { byStatus: this.listByStatus }
        : {}),
      ...(this.listMinPrice != null ? { minPrice: this.listMinPrice } : {}),
      ...(this.listMaxPrice != null ? { maxPrice: this.listMaxPrice } : {}),
      ...(this.listQuantityFrom != null
        ? { quantityFrom: this.listQuantityFrom }
        : {}),
      ...(this.listQuantityTo != null
        ? { quantityTo: this.listQuantityTo }
        : {}),
      ...(this.listWishlistOnly ? { wishlistOnly: true } : {}),
      ...(this.listShowOnlyReserved ? { showOnlyReserved: true } : {}),
      ...(this.listCustomFieldFilters.length
        ? { customFieldFilters: this.listCustomFieldFilters }
        : {}),
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
      const items = [...result.items].sort((a, b) => a.sortOrder - b.sortOrder);

      runInAction(() => {
        this.variantCustomFields = items;
        const fieldMeta = items.map((field) => ({
          id: field.id,
          type: field.type,
          archivedAt: field.archivedAt,
          optionIds: (field.options ?? []).map((option) => option.id),
        }));
        this.listCustomFieldFilters = coerceCustomFieldFiltersToFields(
          this.listCustomFieldFilters,
          fieldMeta,
        );
        this.draftCustomFieldFilters = coerceCustomFieldFiltersToFields(
          this.draftCustomFieldFilters,
          fieldMeta,
        );
        const validFieldIds = new Set(
          items
            .filter((field) => field.archivedAt == null)
            .map((field) => field.id),
        );
        this.draftSelectedCustomFieldIds = [
          ...new Set([
            ...this.draftSelectedCustomFieldIds.filter((id) =>
              validFieldIds.has(id),
            ),
            ...this.draftCustomFieldFilters.map((filter) => filter.fieldId),
          ]),
        ].sort((a, b) => a - b);
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
