import { apiClient } from "@/api/api-client";

import {
  ORDER_STATUS_CATEGORIES,
  type ClientLastOrder,
  type ClientOrderStats,
  type OrderCreatePayload,
  type OrderDetails,
  type OrderListItem,
  type OrderDeliveryPayload,
  type OrderDeliveryTrackingPayload,
  type OrderNovaPoshtaWaybillPayload,
  type OrderNovaPoshtaWaybillResponse,
  type OrderStatus,
  type OrderStatusCategory,
  type OrderStatusCreatePayload,
  type OrderStatusReorderPayload,
  type OrderStatusUpdatePayload,
  type OrderUpdatePayload,
  type OrdersListResponse,
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

function getRecordNumber(
  record: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function normalizeClientLastOrder(data: unknown): ClientLastOrder | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const id = getRecordNumber(record, ["id"]);
  const totalPrice = getRecordNumber(record, ["total_price", "totalPrice"]);
  const rawStatus = record.status;

  if (
    id == null ||
    totalPrice == null ||
    !rawStatus ||
    typeof rawStatus !== "object"
  ) {
    return null;
  }

  const statusRecord = rawStatus as Record<string, unknown>;
  const statusId = getRecordNumber(statusRecord, ["id"]);
  const statusName =
    typeof statusRecord.name === "string" ? statusRecord.name : "";
  const rawCategory = statusRecord.category;
  const statusCategory: OrderStatusCategory =
    typeof rawCategory === "string" &&
    ORDER_STATUS_CATEGORIES.includes(rawCategory as OrderStatusCategory)
      ? (rawCategory as OrderStatusCategory)
      : "new";

  const statusColor =
    typeof statusRecord.color === "string" ? statusRecord.color : "";

  return {
    id,
    totalPrice,
    status: {
      id: statusId ?? 0,
      name: statusName,
      category: statusCategory,
      color: statusColor,
    },
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

  update: async (
    orderId: number,
    payload: OrderUpdatePayload,
  ): Promise<void> => {
    await apiClient.patch(`${basePath}/${orderId}`, payload);
  },

  updateDelivery: async (
    orderId: number,
    payload: OrderDeliveryPayload,
  ): Promise<void> => {
    await apiClient.patch(`${basePath}/${orderId}/delivery`, payload);
  },

  attachDeliveryTracking: async (
    orderId: number,
    payload: OrderDeliveryTrackingPayload,
  ): Promise<void> => {
    await apiClient.post(`${basePath}/${orderId}/delivery/tracking`, payload);
  },

  createNovaPoshtaWaybill: async (
    orderId: number,
    payload: OrderNovaPoshtaWaybillPayload,
  ): Promise<OrderNovaPoshtaWaybillResponse> => {
    const { data } = await apiClient.post<OrderNovaPoshtaWaybillResponse>(
      `${basePath}/${orderId}/novaposhta/waybill`,
      payload,
    );

    return data;
  },

  removeNovaPoshtaWaybill: async (orderId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${orderId}/novaposhta/waybill`);
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

  getClientLastOrder: async (
    clientId: number,
  ): Promise<ClientLastOrder | null> => {
    const { data } = await apiClient.get<unknown>(
      `/clients/${clientId}/last-order`,
    );

    return normalizeClientLastOrder(data);
  },

  listStatuses: async (): Promise<OrderStatus[]> => {
    const { data } = await apiClient.get<OrderStatus[]>(`${basePath}/statuses`);

    return data;
  },

  createStatus: async (
    payload: OrderStatusCreatePayload,
  ): Promise<OrderStatus> => {
    const { data } = await apiClient.post<OrderStatus>(
      `${basePath}/statuses`,
      payload,
    );

    return data;
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

  reorderStatuses: async (
    payload: OrderStatusReorderPayload,
  ): Promise<OrderStatus[]> => {
    const { data } = await apiClient.put<OrderStatus[]>(
      `${basePath}/statuses/order`,
      payload,
    );

    return data;
  },

  deleteStatus: async (statusId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/statuses/${statusId}`);
  },
};
