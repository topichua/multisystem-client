import { apiClient } from '@/api/api-client';

import type {
  ClientOrderStats,
  OrderCreatePayload,
  OrderListItem,
  OrderStatus,
  OrderStatusUpdatePayload,
  OrdersListResponse,
} from '@/features/orders/model/order.types';

const basePath = '/orders';

function normalizeOrdersList(data: unknown): OrdersListResponse {
  if (!data || typeof data !== 'object') {
    return { items: [], total: 0, page: 1, pageSize: 50 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items) ? (record.items as OrderListItem[]) : [];
  const total = typeof record.total === 'number' ? record.total : items.length;
  const pageSize = typeof record.pageSize === 'number' ? record.pageSize : 50;
  const page = typeof record.page === 'number' ? record.page : 1;

  return { items, total, page, pageSize };
}

function normalizeOrderStatusesList(data: unknown): OrderStatus[] {
  if (Array.isArray(data)) {
    return data as OrderStatus[];
  }

  if (data && typeof data === 'object') {
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
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return null;
}

function normalizeClientOrderStats(data: unknown, clientId: number): ClientOrderStats {
  if (!data || typeof data !== 'object') {
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
    clientId: typeof record.clientId === 'number' ? record.clientId : clientId,
    orderCount: typeof record.orderCount === 'number' ? record.orderCount : 0,
    totalSpent: typeof record.totalSpent === 'number' ? record.totalSpent : 0,
    averageOrderPrice: typeof record.averageOrderPrice === 'number' ? record.averageOrderPrice : 0,
    lastOrderAt: normalizeLastOrderAt(record.lastOrderAt),
  };
}

export type OrdersListQueryParams = {
  page?: number;
  pageSize?: number;
  statusId?: number | null;
  clientId?: number;
};

function ordersListQueryToRecord(params: OrdersListQueryParams): Record<string, number> {
  const out: Record<string, number> = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
  };

  if (params.statusId != null) {
    out.statusId = params.statusId;
  }

  if (params.clientId != null) {
    out.clientId = params.clientId;
  }

  return out;
}

export const ordersApi = {
  list: async (params?: OrdersListQueryParams): Promise<OrdersListResponse> => {
    const { data } = await apiClient.get<unknown>(basePath, {
      params: ordersListQueryToRecord(params ?? {}),
    });

    return normalizeOrdersList(data);
  },

  create: async (payload: OrderCreatePayload): Promise<OrderListItem> => {
    const { data } = await apiClient.post<OrderListItem>(basePath, payload);

    return data;
  },

  listByClient: async (
    clientId: number,
    params?: Pick<OrdersListQueryParams, 'page' | 'pageSize'>,
  ): Promise<OrdersListResponse> => {
    const { data } = await apiClient.get<unknown>(`/clients/${clientId}/orders`, {
      params: ordersListQueryToRecord({
        page: params?.page,
        pageSize: params?.pageSize,
        clientId: clientId,
      }),
    });

    return normalizeOrdersList(data);
  },

  getClientStats: async (clientId: number): Promise<ClientOrderStats> => {
    const { data } = await apiClient.get<unknown>(`/clients/${clientId}/orders/stats`);

    return normalizeClientOrderStats(data, clientId);
  },

  listStatuses: async (): Promise<OrderStatus[]> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/statuses`);

    return normalizeOrderStatusesList(data);
  },

  updateOrderStatus: async (orderId: number, statusId: number): Promise<OrderListItem> => {
    const { data } = await apiClient.patch<OrderListItem>(`${basePath}/${orderId}/status`, {
      statusId,
    });

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
    const { data } = await apiClient.put<unknown>(`${basePath}/statuses/order`, { ids });

    return normalizeOrderStatusesList(data);
  },
};
