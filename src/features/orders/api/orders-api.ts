import { apiClient } from "@/api/api-client";
import { asNumber, asRecord, asString, isRecord } from "@/api/record-parsing";

import { normalizeCreateExportResponse } from "@/features/exports/api/exports-api";
import type {
  CreateExportResponse,
  CreateOrderExportPayload,
} from "@/features/exports/model/export.types";
import {
  ORDER_STATUS_CATEGORIES,
  type ClientLastOrder,
  type ClientOrderStats,
  type OrderConfirmPaymentTransactionPayload,
  type OrderCreatePayload,
  type OrderDetails,
  type OrderListItem,
  type OrderDeliveryPayload,
  type OrderDeliveryPaymentPayload,
  type OrderDeliveryTrackingPayload,
  type OrderManualPaymentPayload,
  type OrderNovaPoshtaWaybillPayload,
  type OrderNovaPoshtaWaybillResponse,
  type OrderOnlinePayment,
  type OrderOnlinePaymentPayload,
  type OrderPaymentMutationResponse,
  type OrderPaymentsSummary,
  type OrderRefund,
  type OrderRefundApprovePayload,
  type OrderRefundCreatePayload,
  type OrderRefundMutationResponse,
  type OrderRefundsListResponse,
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
  const record = asRecord(data);
  const items = Array.isArray(record.items)
    ? (record.items as OrderListItem[])
    : [];

  return {
    items,
    total: asNumber(record.total) ?? items.length,
    page: asNumber(record.page) ?? 1,
    pageSize: asNumber(record.pageSize) ?? 50,
  };
}

function normalizeLastOrderAt(value: unknown): string | null {
  return asString(value) || null;
}

function normalizeClientOrderStats(
  data: unknown,
  clientId: number,
): ClientOrderStats {
  const record = asRecord(data);

  return {
    clientId: asNumber(record.clientId) ?? clientId,
    orderCount: asNumber(record.orderCount) ?? 0,
    totalSpent: asNumber(record.totalSpent) ?? 0,
    averageOrderPrice: asNumber(record.averageOrderPrice) ?? 0,
    lastOrderAt: normalizeLastOrderAt(record.lastOrderAt),
  };
}

function normalizeClientLastOrder(data: unknown): ClientLastOrder | null {
  if (!isRecord(data)) {
    return null;
  }

  const id = asNumber(data.id);
  const totalPrice = asNumber(data.total_price);
  const rawStatus = data.status;

  if (id == null || totalPrice == null || !isRecord(rawStatus)) {
    return null;
  }

  const statusId = asNumber(rawStatus.id);
  const statusName = asString(rawStatus.name) ?? "";
  const rawCategory = rawStatus.category;
  const statusCategory: OrderStatusCategory =
    typeof rawCategory === "string" &&
    ORDER_STATUS_CATEGORIES.includes(rawCategory as OrderStatusCategory)
      ? (rawCategory as OrderStatusCategory)
      : "new";

  return {
    id,
    totalPrice,
    status: {
      id: statusId ?? 0,
      name: statusName,
      category: statusCategory,
      color: asString(rawStatus.color) ?? "",
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

  createExport: async (
    payload: CreateOrderExportPayload,
  ): Promise<CreateExportResponse> => {
    const { data } = await apiClient.post<unknown>(
      `${basePath}/export`,
      payload,
    );
    return normalizeCreateExportResponse(data);
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

  createDeliveryPayment: async (
    orderId: number,
    payload: OrderDeliveryPaymentPayload,
  ): Promise<OrderPaymentMutationResponse> => {
    const { data } = await apiClient.post<OrderPaymentMutationResponse>(
      `${basePath}/${orderId}/delivery/payment`,
      payload,
    );

    return data;
  },

  createManualPayment: async (
    orderId: number,
    payload: OrderManualPaymentPayload,
  ): Promise<OrderPaymentMutationResponse> => {
    const { data } = await apiClient.post<OrderPaymentMutationResponse>(
      `${basePath}/${orderId}/payments/manual`,
      payload,
    );

    return data;
  },

  createOnlinePayment: async (
    orderId: number,
    payload: OrderOnlinePaymentPayload,
  ): Promise<OrderOnlinePayment> => {
    const { data } = await apiClient.post<OrderOnlinePayment>(
      `${basePath}/${orderId}/payments`,
      payload,
    );

    return data;
  },

  listOrderPayments: async (orderId: number): Promise<OrderPaymentsSummary> => {
    const { data } = await apiClient.get<OrderPaymentsSummary>(
      `${basePath}/${orderId}/payments`,
    );

    return data;
  },

  confirmPaymentTransaction: async (
    orderId: number,
    transactionId: number,
    payload: OrderConfirmPaymentTransactionPayload = {},
  ): Promise<OrderPaymentMutationResponse> => {
    const { data } = await apiClient.post<OrderPaymentMutationResponse>(
      `${basePath}/${orderId}/payments/transactions/${transactionId}/confirm`,
      payload,
    );

    return data;
  },

  deletePayment: async (orderId: number, paymentId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${orderId}/payments/${paymentId}`);
  },

  listOrderRefunds: async (
    orderId: number,
  ): Promise<OrderRefundsListResponse> => {
    const { data } = await apiClient.get<OrderRefundsListResponse>(
      `${basePath}/${orderId}/refunds`,
    );

    return data;
  },

  createOrderRefund: async (
    orderId: number,
    payload: OrderRefundCreatePayload,
  ): Promise<OrderRefund> => {
    const { data } = await apiClient.post<OrderRefund>(
      `${basePath}/${orderId}/refunds`,
      payload,
    );

    return data;
  },

  approveOrderRefund: async (
    orderId: number,
    refundId: number,
    payload: OrderRefundApprovePayload = {},
  ): Promise<OrderRefundMutationResponse> => {
    const { data } = await apiClient.post<OrderRefundMutationResponse>(
      `${basePath}/${orderId}/refunds/${refundId}/approve`,
      payload,
    );

    return data;
  },

  deleteOrderRefund: async (
    orderId: number,
    refundId: number,
  ): Promise<void> => {
    await apiClient.delete(`${basePath}/${orderId}/refunds/${refundId}`);
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
