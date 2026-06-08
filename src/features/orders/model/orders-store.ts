import dayjs from "dayjs";
import { makeAutoObservable, runInAction } from "mobx";

import { ordersApi } from "@/features/orders/api/orders-api";
import type { OrderSourceFilter } from "@/features/orders/model/order-list.constants";
import {
  normalizeAppliedListKeyword,
  ordersListAppliedUrlStateEquals,
  type OrdersListAppliedUrlState,
} from "@/features/orders/model/orders-list-url";
import type {
  BuildOrderCreatePayloadInput,
  ClientOrderStats,
  OrderCreatePayload,
  OrderListItem,
  OrderStatus,
  OrderStatusUpdatePayload,
} from "@/features/orders/model/order.types";
import { buildOrderCreatePayload } from "@/features/orders/utils/build-order-create-payload";
import { productsApi } from "@/features/products/api/products-api";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

const defaultPageSize = 50;
const minCatalogSearchLength = 3;

function snapshotFromStore(store: OrdersStore): OrdersListAppliedUrlState {
  return {
    keyword: store.listKeyword,
    statusIds: [...store.listStatusIds],
    sources: [...store.listSources],
    totalPriceFrom: store.listTotalPriceFrom,
    totalPriceTo: store.listTotalPriceTo,
    createdFrom: store.listCreatedFrom,
    createdTo: store.listCreatedTo,
    page: store.page,
    pageSize: store.pageSize,
  };
}

function toApiIsoDateStart(value: string): string {
  return dayjs(value).startOf("day").toISOString();
}

function toApiIsoDateEnd(value: string): string {
  return dayjs(value).endOf("day").toISOString();
}

export class OrdersStore {
  orders: OrderListItem[] = [];
  total = 0;
  page = 1;
  pageSize = defaultPageSize;
  statusId: number | null = null;

  listKeyword = "";
  listStatusIds: number[] = [];
  listSources: OrderSourceFilter[] = [];
  listTotalPriceFrom: number | null = null;
  listTotalPriceTo: number | null = null;
  listCreatedFrom: string | null = null;
  listCreatedTo: string | null = null;

  draftStatusIds: number[] = [];
  draftSources: OrderSourceFilter[] = [];
  draftTotalPriceFrom: number | null = null;
  draftTotalPriceTo: number | null = null;
  draftCreatedFrom: string | null = null;
  draftCreatedTo: string | null = null;

  listLoading = false;
  listError: string | null = null;
  createLoading = false;

  catalogSearchResults: CatalogVariant[] = [];
  catalogSearchLoading = false;

  clientStats: ClientOrderStats | null = null;
  clientStatsClientId: number | null = null;
  clientStatsLoading = false;
  clientStatsError: string | null = null;

  clientOrders: OrderListItem[] = [];
  clientOrdersTotal = 0;
  clientOrdersClientId: number | null = null;
  clientOrdersLoading = false;
  clientOrdersError: string | null = null;

  statuses: OrderStatus[] = [];
  statusesLoading = false;
  statusesError: string | null = null;
  statusSaveLoading = false;
  updatingOrderStatusId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get appliedUrlSnapshot(): OrdersListAppliedUrlState {
    return snapshotFromStore(this);
  }

  get appliedNonKeywordFilterCount(): number {
    let count = this.listStatusIds.length + this.listSources.length;
    if (this.listTotalPriceFrom != null || this.listTotalPriceTo != null) {
      count += 1;
    }
    if (this.listCreatedFrom != null || this.listCreatedTo != null) {
      count += 1;
    }
    return count;
  }

  assignListStateFromUrl(parsed: OrdersListAppliedUrlState): boolean {
    const next: OrdersListAppliedUrlState = {
      ...parsed,
      statusIds: [...new Set(parsed.statusIds)],
      sources: [...new Set(parsed.sources)],
    };
    if (ordersListAppliedUrlStateEquals(snapshotFromStore(this), next)) {
      return false;
    }
    runInAction(() => {
      this.listKeyword = normalizeAppliedListKeyword(next.keyword);
      this.listStatusIds = next.statusIds;
      this.listSources = next.sources;
      this.listTotalPriceFrom = next.totalPriceFrom;
      this.listTotalPriceTo = next.totalPriceTo;
      this.listCreatedFrom = next.createdFrom;
      this.listCreatedTo = next.createdTo;
      this.page = next.page;
      this.pageSize = next.pageSize;
    });
    return true;
  }

  syncFilterDraftFromApplied = (): void => {
    runInAction(() => {
      this.draftStatusIds = [...this.listStatusIds];
      this.draftSources = [...this.listSources];
      this.draftTotalPriceFrom = this.listTotalPriceFrom;
      this.draftTotalPriceTo = this.listTotalPriceTo;
      this.draftCreatedFrom = this.listCreatedFrom;
      this.draftCreatedTo = this.listCreatedTo;
    });
  };

  resetFilterDraft = (): void => {
    runInAction(() => {
      this.draftStatusIds = [];
      this.draftSources = [];
      this.draftTotalPriceFrom = null;
      this.draftTotalPriceTo = null;
      this.draftCreatedFrom = null;
      this.draftCreatedTo = null;
    });
  };

  setDraftStatusIds = (ids: number[]): void => {
    runInAction(() => {
      this.draftStatusIds = ids;
    });
  };

  setDraftSources = (sources: OrderSourceFilter[]): void => {
    runInAction(() => {
      this.draftSources = sources;
    });
  };

  setDraftTotalPriceFrom = (value: number | null): void => {
    runInAction(() => {
      this.draftTotalPriceFrom = value;
    });
  };

  setDraftTotalPriceTo = (value: number | null): void => {
    runInAction(() => {
      this.draftTotalPriceTo = value;
    });
  };

  setDraftCreatedFrom = (value: string | null): void => {
    runInAction(() => {
      this.draftCreatedFrom = value;
    });
  };

  setDraftCreatedTo = (value: string | null): void => {
    runInAction(() => {
      this.draftCreatedTo = value;
    });
  };

  applyFiltersFromPanel = (): void => {
    runInAction(() => {
      this.listStatusIds = [...new Set(this.draftStatusIds)];
      this.listSources = [...new Set(this.draftSources)];
      this.listTotalPriceFrom = this.draftTotalPriceFrom;
      this.listTotalPriceTo = this.draftTotalPriceTo;
      this.listCreatedFrom = this.draftCreatedFrom;
      this.listCreatedTo = this.draftCreatedTo;
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

  setListPage = (nextPage: number): void => {
    const safe = Math.max(1, nextPage);
    runInAction(() => {
      this.page = safe;
    });
  };

  removeListStatusId = (id: number): void => {
    runInAction(() => {
      this.listStatusIds = this.listStatusIds.filter(
        (statusId) => statusId !== id,
      );
      this.page = 1;
    });
  };

  removeListSource = (source: OrderSourceFilter): void => {
    runInAction(() => {
      this.listSources = this.listSources.filter((item) => item !== source);
      this.page = 1;
    });
  };

  clearListTotalPriceRange = (): void => {
    runInAction(() => {
      this.listTotalPriceFrom = null;
      this.listTotalPriceTo = null;
      this.page = 1;
    });
  };

  clearListCreatedRange = (): void => {
    runInAction(() => {
      this.listCreatedFrom = null;
      this.listCreatedTo = null;
      this.page = 1;
    });
  };

  clearListKeyword = (): void => {
    runInAction(() => {
      this.listKeyword = "";
      this.page = 1;
    });
  };

  clearAllListFilters = (): void => {
    runInAction(() => {
      this.listKeyword = "";
      this.listStatusIds = [];
      this.listSources = [];
      this.listTotalPriceFrom = null;
      this.listTotalPriceTo = null;
      this.listCreatedFrom = null;
      this.listCreatedTo = null;
      this.page = 1;
      this.pageSize = defaultPageSize;
    });
  };

  private buildListQueryParams() {
    return {
      page: this.page,
      pageSize: this.pageSize,
      ...(this.listKeyword ? { keyword: this.listKeyword } : {}),
      ...(this.listStatusIds.length ? { statuses: this.listStatusIds } : {}),
      ...(this.listSources.length ? { sources: [...this.listSources] } : {}),
      ...(this.listTotalPriceFrom != null
        ? { totalPriceFrom: this.listTotalPriceFrom }
        : {}),
      ...(this.listTotalPriceTo != null
        ? { totalPriceTo: this.listTotalPriceTo }
        : {}),
      ...(this.listCreatedFrom
        ? { createdFrom: toApiIsoDateStart(this.listCreatedFrom) }
        : {}),
      ...(this.listCreatedTo
        ? { createdTo: toApiIsoDateEnd(this.listCreatedTo) }
        : {}),
    };
  }

  loadOrders = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const response = await ordersApi.list(this.buildListQueryParams());
      runInAction(() => {
        this.orders = response.items;
        this.total = response.total;
        this.page = response.page;
        this.pageSize = response.pageSize;
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

  searchCatalogVariants = async (keyword: string): Promise<void> => {
    const query = keyword.trim();
    if (query.length < minCatalogSearchLength) {
      runInAction(() => {
        this.catalogSearchResults = [];
        this.catalogSearchLoading = false;
      });
      return;
    }

    runInAction(() => {
      this.catalogSearchLoading = true;
    });

    try {
      const response = await productsApi.listCatalogVariants({
        keyword: query,
      });
      runInAction(() => {
        this.catalogSearchResults = response.items;
      });
    } catch {
      runInAction(() => {
        this.catalogSearchResults = [];
      });
    } finally {
      runInAction(() => {
        this.catalogSearchLoading = false;
      });
    }
  };

  clearCatalogSearch = (): void => {
    runInAction(() => {
      this.catalogSearchResults = [];
      this.catalogSearchLoading = false;
    });
  };

  setPage = (page: number): void => {
    this.page = page;
  };

  loadStatuses = async (options?: { force?: boolean }): Promise<void> => {
    if (this.statuses.length > 0 && options?.force !== true) {
      return;
    }

    runInAction(() => {
      this.statusesLoading = true;
      this.statusesError = null;
    });

    try {
      const items = await ordersApi.listStatuses();
      runInAction(() => {
        this.statuses = items;
      });
    } catch (e) {
      runInAction(() => {
        this.statusesError = unknownErrorMessage(e);
      });
    } finally {
      runInAction(() => {
        this.statusesLoading = false;
      });
    }
  };

  get statusById(): Map<number, OrderStatus> {
    return new Map(this.statuses.map((status) => [status.id, status]));
  }

  reorderStatuses = async (ids: number[]): Promise<void> => {
    const previous = [...this.statuses];
    const byId = new Map(previous.map((status) => [status.id, status]));
    const optimistic = ids
      .map((id, index) => {
        const status = byId.get(id);
        if (!status) {
          return null;
        }

        return { ...status, sortOrder: index };
      })
      .filter((status): status is OrderStatus => status != null);

    if (optimistic.length !== ids.length) {
      return;
    }

    runInAction(() => {
      this.statuses = optimistic;
      this.statusesError = null;
    });

    try {
      const items = await ordersApi.reorderStatuses(ids);
      runInAction(() => {
        this.statuses = items;
      });
    } catch (e) {
      runInAction(() => {
        this.statuses = previous;
        this.statusesError = unknownErrorMessage(e);
      });
      throw e;
    }
  };

  updateStatus = async (
    statusId: number,
    payload: OrderStatusUpdatePayload,
  ): Promise<void> => {
    runInAction(() => {
      this.statusSaveLoading = true;
    });

    try {
      const updated = await ordersApi.updateStatus(statusId, payload);
      runInAction(() => {
        this.statuses = this.statuses.map((status) => {
          if (status.id === statusId) {
            return updated;
          }

          if (updated.isDefault && status.isDefault) {
            return { ...status, isDefault: false };
          }

          return status;
        });
        this.orders = this.orders.map((order) => {
          if (order.statusId === statusId) {
            return { ...order, status: updated };
          }

          if (updated.isDefault && order.status.isDefault) {
            return { ...order, status: { ...order.status, isDefault: false } };
          }

          return order;
        });
        this.clientOrders = this.clientOrders.map((order) => {
          if (order.statusId === statusId) {
            return { ...order, status: updated };
          }

          if (updated.isDefault && order.status.isDefault) {
            return { ...order, status: { ...order.status, isDefault: false } };
          }

          return order;
        });
      });
    } finally {
      runInAction(() => {
        this.statusSaveLoading = false;
      });
    }
  };

  private replaceOrderInLists = (updated: OrderListItem): void => {
    this.orders = this.orders.map((order) =>
      order.id === updated.id ? updated : order,
    );
    this.clientOrders = this.clientOrders.map((order) =>
      order.id === updated.id ? updated : order,
    );
  };

  updateOrderStatus = async (
    orderId: number,
    statusId: number,
  ): Promise<void> => {
    const current = this.orders.find((order) => order.id === orderId);
    if (current?.statusId === statusId) {
      return;
    }

    runInAction(() => {
      this.updatingOrderStatusId = orderId;
    });

    try {
      const updated = await ordersApi.updateOrderStatus(orderId, statusId);
      runInAction(() => {
        this.replaceOrderInLists(updated);
      });
      if (
        this.listStatusIds.length > 0 &&
        !this.listStatusIds.includes(updated.statusId)
      ) {
        await this.loadOrders({ silent: true });
      }
    } finally {
      runInAction(() => {
        this.updatingOrderStatusId = null;
      });
    }
  };

  loadClientStats = async (clientId: number): Promise<void> => {
    runInAction(() => {
      this.clientStatsClientId = clientId;
      this.clientStatsLoading = true;
      this.clientStatsError = null;
    });

    try {
      const stats = await ordersApi.getClientStats(clientId);
      runInAction(() => {
        if (this.clientStatsClientId === clientId) {
          this.clientStats = stats;
        }
      });
    } catch (e) {
      runInAction(() => {
        if (this.clientStatsClientId === clientId) {
          this.clientStatsError = unknownErrorMessage(e);
          this.clientStats = null;
        }
      });
    } finally {
      runInAction(() => {
        if (this.clientStatsClientId === clientId) {
          this.clientStatsLoading = false;
        }
      });
    }
  };

  clearClientStats = (): void => {
    runInAction(() => {
      this.clientStats = null;
      this.clientStatsClientId = null;
      this.clientStatsLoading = false;
      this.clientStatsError = null;
    });
  };

  loadClientOrders = async (clientId: number): Promise<void> => {
    runInAction(() => {
      this.clientOrdersClientId = clientId;
      this.clientOrdersLoading = true;
      this.clientOrdersError = null;
    });

    try {
      const response = await ordersApi.listByClient(clientId, {
        page: 1,
        pageSize: defaultPageSize,
      });
      runInAction(() => {
        if (this.clientOrdersClientId === clientId) {
          this.clientOrders = response.items;
          this.clientOrdersTotal = response.total;
        }
      });
    } catch (e) {
      runInAction(() => {
        if (this.clientOrdersClientId === clientId) {
          this.clientOrdersError = unknownErrorMessage(e);
          this.clientOrders = [];
          this.clientOrdersTotal = 0;
        }
      });
    } finally {
      runInAction(() => {
        if (this.clientOrdersClientId === clientId) {
          this.clientOrdersLoading = false;
        }
      });
    }
  };

  clearClientOrders = (): void => {
    runInAction(() => {
      this.clientOrders = [];
      this.clientOrdersTotal = 0;
      this.clientOrdersClientId = null;
      this.clientOrdersLoading = false;
      this.clientOrdersError = null;
    });
  };

  createOrder = async (
    input: BuildOrderCreatePayloadInput,
  ): Promise<OrderListItem> => {
    const payload: OrderCreatePayload = buildOrderCreatePayload(input);

    runInAction(() => {
      this.createLoading = true;
    });

    try {
      const created = await ordersApi.create(payload);
      await this.loadOrders({ silent: true });
      if (this.clientOrdersClientId != null) {
        await this.loadClientOrders(this.clientOrdersClientId);
      }
      return created;
    } finally {
      runInAction(() => {
        this.createLoading = false;
      });
    }
  };
}
