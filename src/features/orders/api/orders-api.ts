import { apiClient } from "@/api/api-client";

import type {
  ClientOrderStats,
  OrderCreatePayload,
  OrderDetails,
  OrderListItem,
  OrderStatus,
  OrderStatusUpdatePayload,
  OrdersListResponse,
} from "@/features/orders/model/order.types";

const basePath = "/orders";

function normalizeOrdersList(data: unknown): OrdersListResponse {
  if (!data || typeof data !== "object") {
    return { items: [], total: 0, page: 1, pageSize: 50 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? (record.items as OrderListItem[])
    : [];
  const total = typeof record.total === "number" ? record.total : items.length;
  const pageSize = typeof record.pageSize === "number" ? record.pageSize : 50;
  const page = typeof record.page === "number" ? record.page : 1;

  return { items, total, page, pageSize };
}

function normalizeOrderStatusesList(data: unknown): OrderStatus[] {
  if (Array.isArray(data)) {
    return data as OrderStatus[];
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (Array.isArray(record.items)) {
      return record.items as OrderStatus[];
    }

    if (Array.isArray(record.statuses)) {
      return record.statuses as OrderStatus[];
    }
  }

  return [];
}

function normalizeLastOrderAt(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return null;
}

function normalizeClientOrderStats(
  data: unknown,
  clientId: number,
): ClientOrderStats {
  if (!data || typeof data !== "object") {
    return {
      clientId,
      orderCount: 0,
      totalSpent: 0,
      averageOrderPrice: 0,
      lastOrderAt: null,
    };
  }

  const record = data as Record<string, unknown>;

  return {
    clientId: typeof record.clientId === "number" ? record.clientId : clientId,
    orderCount: typeof record.orderCount === "number" ? record.orderCount : 0,
    totalSpent: typeof record.totalSpent === "number" ? record.totalSpent : 0,
    averageOrderPrice:
      typeof record.averageOrderPrice === "number"
        ? record.averageOrderPrice
        : 0,
    lastOrderAt: normalizeLastOrderAt(record.lastOrderAt),
  };
}

export type OrdersListQueryParams = {
  page?: number;
  pageSize?: number;
  statusId?: number | null;
  clientId?: number;
  statuses?: number[];
  keyword?: string;
  createdFrom?: string;
  createdTo?: string;
  totalPriceFrom?: number;
  totalPriceTo?: number;
  sources?: string[];
};

export type ClientOrdersQueryParams = Omit<OrdersListQueryParams, "clientId">;

type BuildOrdersListSearchParamsOptions = {
  includeClientId?: boolean;
};

function buildOrdersListSearchParams(
  params: OrdersListQueryParams,
  options: BuildOrdersListSearchParamsOptions = {},
): URLSearchParams {
  const includeClientId = options.includeClientId !== false;
  const sp = new URLSearchParams();
  sp.set("page", String(params.page ?? 1));
  sp.set("pageSize", String(params.pageSize ?? 50));

  if (params.statusId != null) {
    sp.set("statusId", String(params.statusId));
  }

  if (includeClientId && params.clientId != null) {
    sp.set("clientId", String(params.clientId));
  }

  if (params.statuses?.length) {
    sp.set("statuses", [...new Set(params.statuses)].join(","));
  }

  if (params.keyword) {
    sp.set("keyword", params.keyword);
  }

  if (params.createdFrom) {
    sp.set("createdFrom", params.createdFrom);
  }

  if (params.createdTo) {
    sp.set("createdTo", params.createdTo);
  }

  if (params.totalPriceFrom != null) {
    sp.set("totalPriceFrom", String(params.totalPriceFrom));
  }

  if (params.totalPriceTo != null) {
    sp.set("totalPriceTo", String(params.totalPriceTo));
  }

  if (params.sources?.length) {
    sp.set("sources", [...new Set(params.sources)].join(","));
  }

  return sp;
}

export const ordersApi = {
  list: async (params?: OrdersListQueryParams): Promise<OrdersListResponse> => {
    const { data } = await apiClient.get<unknown>(basePath, {
      params: buildOrdersListSearchParams(params ?? {}),
    });

    return normalizeOrdersList(data);
  },

  getById: async (orderId: number): Promise<OrderDetails> => {
    const { data } = await apiClient.get<OrderDetails>(
      `${basePath}/${orderId}`,
    );
    return data;
  },

  create: async (payload: OrderCreatePayload): Promise<OrderListItem> => {
    const { data } = await apiClient.post<OrderListItem>(basePath, payload);

    return data;
  },

  getClientOrders: async (
    clientId: number,
    params: ClientOrdersQueryParams = {},
  ): Promise<OrdersListResponse> => {
    const { data } = await apiClient.get<unknown>(
      `/clients/${clientId}/orders`,
      {
        params: buildOrdersListSearchParams(params, {
          includeClientId: false,
        }),
      },
    );

    return normalizeOrdersList(data);
  },

  getClientOrderStats: async (clientId: number): Promise<ClientOrderStats> =>
    ordersApi.getClientStats(clientId),

  getClientStats: async (clientId: number): Promise<ClientOrderStats> => {
    const { data } = await apiClient.get<unknown>(
      `/clients/${clientId}/orders/stats`,
    );

    return normalizeClientOrderStats(data, clientId);
  },

  listStatuses: async (): Promise<OrderStatus[]> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/statuses`);

    return normalizeOrderStatusesList(data);
  },

  updateOrderStatus: async (
    orderId: number,
    statusId: number,
  ): Promise<OrderListItem> => {
    const { data } = await apiClient.patch<OrderListItem>(
      `${basePath}/${orderId}/status`,
      {
        statusId,
      },
    );

    return data;
  },

  updateStatus: async (
    statusId: number,
    payload: OrderStatusUpdatePayload,
  ): Promise<OrderStatus> => {
    const { data } = await apiClient.patch<OrderStatus>(
      `${basePath}/statuses/${statusId}`,
      payload,
    );

    return data;
  },

  reorderStatuses: async (ids: number[]): Promise<OrderStatus[]> => {
    const { data } = await apiClient.put<unknown>(
      `${basePath}/statuses/order`,
      { ids },
    );

    return normalizeOrderStatusesList(data);
  },
};
