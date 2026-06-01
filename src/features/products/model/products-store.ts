import { makeAutoObservable, runInAction } from "mobx";

import { productsApi } from "@/features/products/api/products-api";
import type {
  CreateProductPayload,
  VariantCustomField,
} from "@/features/products/model/product-create-api.types";
import type {
  Product,
  ProductDetails,
  // ProductUpdatePayload,
  ProductsListSort,
} from "@/features/products/model/product.types";
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

const defaultPageSize = 10;

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
  pageSize = defaultPageSize;
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
  saveLoading = false;
  deleteLoadingId: number | null = null;
  variantSaveLoading = false;
  variantDeleteLoadingId: number | null = null;
  detailLoading = false;
  detailError: string | null = null;

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
    void this.loadProducts();
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
    void this.loadProducts();
  };

  setListSort = (sort: ProductsListSort): void => {
    runInAction(() => {
      this.listSort = sort;
      this.page = 1;
    });
    void this.loadProducts();
  };

  setListPage = (nextPage: number): void => {
    const safe = Math.max(1, nextPage);
    runInAction(() => {
      this.page = safe;
    });
    void this.loadProducts();
  };

  removeListCategoryId = (id: number): void => {
    runInAction(() => {
      this.listCategoryIds = this.listCategoryIds.filter((c) => c !== id);
      this.page = 1;
    });
    void this.loadProducts();
  };

  clearListStatus = (): void => {
    runInAction(() => {
      this.listStatus = null;
      this.page = 1;
    });
    void this.loadProducts();
  };

  clearListPriceRange = (): void => {
    runInAction(() => {
      this.listMinPrice = null;
      this.listMaxPrice = null;
      this.page = 1;
    });
    void this.loadProducts();
  };

  clearListKeyword = (): void => {
    runInAction(() => {
      this.listKeyword = "";
      this.page = 1;
    });
    void this.loadProducts();
  };

  resetListSortToDefault = (): void => {
    runInAction(() => {
      this.listSort = "created_desc";
      this.page = 1;
    });
    void this.loadProducts();
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
      this.pageSize = defaultPageSize;
    });
    void this.loadProducts();
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
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const created = await productsApi.createProduct(payload);
      runInAction(() => {
        this.activeProduct = created;
      });
      await this.loadProducts({ silent: true });
      return created;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  // updateProduct = async (
  //   id: number,
  //   payload: ProductUpdatePayload,
  //   coverImage?: File | null,
  //   options?: { silent?: boolean },
  // ): Promise<void> => {
  //   if (!options?.silent) {
  //     runInAction(() => {
  //       this.saveLoading = true;
  //     });
  //   }

  //   try {
  //     const updated = await productsApi.update(id, payload, coverImage);
  //     runInAction(() => {
  //       this.activeProduct = updated;
  //     });

  //     await this.loadProducts({ silent: true });
  //   } finally {
  //     if (!options?.silent) {
  //       runInAction(() => {
  //         this.saveLoading = false;
  //       });
  //     }
  //   }
  // };

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

  // loadProductById = async (
  //   id: number,
  //   options?: { silent?: boolean },
  // ): Promise<void> => {
  //   if (!options?.silent) {
  //     runInAction(() => {
  //       this.detailLoading = true;
  //       this.detailError = null;
  //     });
  //   }

  //   try {
  //     const data = await productsApi.getById(id);
  //     runInAction(() => {
  //       this.activeProduct = data;
  //     });
  //   } catch (e) {
  //     if (!options?.silent) {
  //       runInAction(() => {
  //         this.detailError = unknownErrorMessage(e);
  //       });
  //     }
  //     throw e;
  //   } finally {
  //     if (!options?.silent) {
  //       runInAction(() => {
  //         this.detailLoading = false;
  //       });
  //     }
  //   }
  // };

  // clearActiveProduct = (): void => {
  //   runInAction(() => {
  //     this.activeProduct = null;
  //     this.detailError = null;
  //   });
  // };

  loadVariantCustomFields = async (): Promise<void> => {
    runInAction(() => {
      this.variantCustomFieldsLoading = true;
    });

    try {
      const result = await productsApi.getVariantCustomFields();

      runInAction(() => {
        this.variantCustomFields = [...result.items].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );
      });
    } catch {
      runInAction(() => {
        this.variantCustomFields = [];
      });
    } finally {
      runInAction(() => {
        this.variantCustomFieldsLoading = false;
      });
    }
  };
  // Variant-related store methods removed — not used by the products list controller.
}
