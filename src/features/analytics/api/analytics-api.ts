import { apiClient } from "@/api/api-client";
import { buildAnalyticsQuery } from "@/features/analytics/api/build-analytics-query";

import type {
  AnalyticsKpi,
  AnalyticsOrdersByStatus,
  AnalyticsQueryParams,
  AnalyticsRevenueChart,
  AnalyticsSalesChannels,
  AnalyticsTopCustomers,
  AnalyticsTopProducts,
} from "@/features/analytics/model/analytics.types";

const basePath = "/analytics/overview";

export const analyticsApi = {
  getKpi: async (params?: AnalyticsQueryParams): Promise<AnalyticsKpi> => {
    const { data } = await apiClient.get<AnalyticsKpi>(`${basePath}/kpi`, {
      params: buildAnalyticsQuery(params),
    });

    return data;
  },

  getRevenueChart: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsRevenueChart> => {
    const { data } = await apiClient.get<AnalyticsRevenueChart>(
      `${basePath}/revenue-chart`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getSalesChannels: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsSalesChannels> => {
    const { data } = await apiClient.get<AnalyticsSalesChannels>(
      `${basePath}/sales-channels`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getOrdersByStatus: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsOrdersByStatus> => {
    const { data } = await apiClient.get<AnalyticsOrdersByStatus>(
      `${basePath}/orders-by-status`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getTopProducts: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsTopProducts> => {
    const { data } = await apiClient.get<AnalyticsTopProducts>(
      `${basePath}/top-products`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getTopCustomers: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsTopCustomers> => {
    const { data } = await apiClient.get<AnalyticsTopCustomers>(
      `${basePath}/top-customers`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },
};
