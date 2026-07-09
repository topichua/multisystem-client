import { apiClient } from "@/api/api-client";
import { asRecord, getNumber, getString } from "@/api/record-parsing";

import type {
  AnalyticsKpi,
  AnalyticsKpiMetric,
  AnalyticsOrderByStatus,
  AnalyticsOrdersByStatus,
  AnalyticsQueryParams,
  AnalyticsRevenueChart,
  AnalyticsRevenueChartPoint,
  AnalyticsSalesChannel,
  AnalyticsSalesChannels,
  AnalyticsTopCustomer,
  AnalyticsTopCustomers,
  AnalyticsTopProduct,
  AnalyticsTopProducts,
} from "@/features/analytics/model/analytics.types";
import { resolveAnalyticsStatusColor } from "@/features/analytics/utils/resolve-analytics-status-color";

const basePath = "/analytics/overview";

function appendIds(
  query: Record<string, string>,
  key: string,
  ids?: number[],
): void {
  if (ids != null && ids.length > 0) {
    query[key] = ids.join(",");
  }
}

function appendStrings(
  query: Record<string, string>,
  key: string,
  values?: string[],
): void {
  if (values != null && values.length > 0) {
    query[key] = values.join(",");
  }
}

function buildQuery(
  params?: AnalyticsQueryParams,
): Record<string, string> | undefined {
  if (!params) {
    return undefined;
  }

  const query: Record<string, string> = {};

  const period = params.period?.trim();
  if (period) {
    query.period = period;
  }

  const dateFrom = params.dateFrom?.trim();
  if (dateFrom) {
    query.dateFrom = dateFrom;
  }

  const dateTo = params.dateTo?.trim();
  if (dateTo) {
    query.dateTo = dateTo;
  }

  appendIds(query, "channelIds", params.channelIds);
  appendIds(query, "managerIds", params.managerIds);
  appendIds(query, "orderStatusIds", params.orderStatusIds);
  appendIds(query, "productIds", params.productIds);
  appendIds(query, "categoryIds", params.categoryIds);
  appendStrings(query, "clientTags", params.clientTags);
  appendStrings(query, "instagramAccounts", params.instagramAccounts);

  return Object.keys(query).length > 0 ? query : undefined;
}

function normalizeKpiMetric(data: unknown): AnalyticsKpiMetric {
  const record = asRecord(data);
  const currency = getString(record, ["currency"]);

  return {
    value: getNumber(record, ["value"]) ?? 0,
    changePercent: getNumber(record, ["changePercent"]) ?? 0,
    ...(currency ? { currency } : {}),
  };
}

function normalizeKpi(data: unknown): AnalyticsKpi {
  const record = asRecord(data);

  return {
    revenue: normalizeKpiMetric(record.revenue),
    orders: normalizeKpiMetric(record.orders),
    averageOrderValue: normalizeKpiMetric(record.averageOrderValue),
    newClients: normalizeKpiMetric(record.newClients),
  };
}

function normalizeRevenueChartPoint(data: unknown): AnalyticsRevenueChartPoint {
  const record = asRecord(data);

  return {
    label: getString(record, ["label"]) ?? "",
    dateFrom: getString(record, ["dateFrom"]) ?? "",
    dateTo: getString(record, ["dateTo"]) ?? "",
    value: getNumber(record, ["value"]) ?? 0,
  };
}

function normalizeRevenueChart(data: unknown): AnalyticsRevenueChart {
  const record = asRecord(data);
  const points = Array.isArray(record.points)
    ? record.points.map(normalizeRevenueChartPoint)
    : [];

  return { points };
}

function normalizeSalesChannel(data: unknown): AnalyticsSalesChannel {
  const record = asRecord(data);

  return {
    name: getString(record, ["name"]) ?? "",
    orders: getNumber(record, ["orders"]) ?? 0,
    percent: getNumber(record, ["percent"]) ?? 0,
  };
}

function normalizeSalesChannels(data: unknown): AnalyticsSalesChannels {
  const record = asRecord(data);
  const channels = Array.isArray(record.channels)
    ? record.channels.map(normalizeSalesChannel)
    : [];

  return {
    totalOrders: getNumber(record, ["totalOrders"]) ?? 0,
    channels,
  };
}

function normalizeOrderByStatus(data: unknown): AnalyticsOrderByStatus {
  const record = asRecord(data);

  return {
    statusId: getNumber(record, ["statusId"]) ?? 0,
    name: getString(record, ["name"]) ?? "",
    color: resolveAnalyticsStatusColor(getString(record, ["color"])),
    count: getNumber(record, ["count"]) ?? 0,
    percent: getNumber(record, ["percent"]) ?? 0,
  };
}

function normalizeOrdersByStatus(data: unknown): AnalyticsOrdersByStatus {
  const record = asRecord(data);
  const statuses = Array.isArray(record.statuses)
    ? record.statuses.map(normalizeOrderByStatus)
    : [];

  return { statuses };
}

function normalizeTopProduct(data: unknown): AnalyticsTopProduct {
  const record = asRecord(data);

  return {
    productId: getNumber(record, ["productId"]) ?? 0,
    variantId: getNumber(record, ["variantId"]) ?? 0,
    name: getString(record, ["name"]) ?? "",
    image: getString(record, ["image"]),
    revenue: getNumber(record, ["revenue"]) ?? 0,
    soldQuantity: getNumber(record, ["soldQuantity"]) ?? 0,
  };
}

function normalizeTopProducts(data: unknown): AnalyticsTopProducts {
  const record = asRecord(data);
  const products = Array.isArray(record.products)
    ? record.products.map(normalizeTopProduct)
    : [];

  return { products };
}

function normalizeTopCustomer(data: unknown): AnalyticsTopCustomer {
  const record = asRecord(data);

  return {
    clientId: getNumber(record, ["clientId"]) ?? 0,
    name: getString(record, ["name"]) ?? "",
    avatar: getString(record, ["avatar"]),
    orders: getNumber(record, ["orders"]) ?? 0,
    spent: getNumber(record, ["spent"]) ?? 0,
  };
}

function normalizeTopCustomers(data: unknown): AnalyticsTopCustomers {
  const record = asRecord(data);
  const customers = Array.isArray(record.customers)
    ? record.customers.map(normalizeTopCustomer)
    : [];

  return { customers };
}

export const analyticsApi = {
  getKpi: async (params?: AnalyticsQueryParams): Promise<AnalyticsKpi> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/kpi`, {
      params: buildQuery(params),
    });

    return normalizeKpi(data);
  },

  getRevenueChart: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsRevenueChart> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/revenue-chart`, {
      params: buildQuery(params),
    });

    return normalizeRevenueChart(data);
  },

  getSalesChannels: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsSalesChannels> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/sales-channels`,
      {
        params: buildQuery(params),
      },
    );

    return normalizeSalesChannels(data);
  },

  getOrdersByStatus: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsOrdersByStatus> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/orders-by-status`,
      {
        params: buildQuery(params),
      },
    );

    return normalizeOrdersByStatus(data);
  },

  getTopProducts: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsTopProducts> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/top-products`, {
      params: buildQuery(params),
    });

    return normalizeTopProducts(data);
  },

  getTopCustomers: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsTopCustomers> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/top-customers`, {
      params: buildQuery(params),
    });

    return normalizeTopCustomers(data);
  },
};
