import { makeAutoObservable, runInAction } from "mobx";

import { ordersApi } from "@/features/orders/api/orders-api";
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

export class OrdersStore {
  orders: OrderListItem[] = [];
  total = 0;
  page = 1;
  pageSize = defaultPageSize;
  statusId: number | null = null;

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

  loadOrders = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const response = await ordersApi.list({
        page: this.page,
        pageSize: this.pageSize,
        statusId: this.statusId,
      });
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
