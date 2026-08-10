import { apiClient } from "@/api/api-client";
import { buildAnalyticsQuery } from "@/features/analytics/api/build-analytics-query";

import type {
  AnalyticsClientsAcquisitionSources,
  AnalyticsClientsKpi,
  AnalyticsClientsNewVsRepeat,
  AnalyticsClientsRepeatFunnel,
  AnalyticsClientsReturnTiming,
  AnalyticsClientsTopValuable,
  AnalyticsClientsTopValuableSort,
  AnalyticsClientsWinBack,
  AnalyticsQueryParams,
} from "@/features/analytics/model/analytics.types";

const basePath = "/analytics/clients";

export const analyticsClientsApi = {
  getKpi: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsClientsKpi> => {
    const { data } = await apiClient.get<AnalyticsClientsKpi>(
      `${basePath}/kpi`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getNewVsRepeat: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsClientsNewVsRepeat> => {
    const { data } = await apiClient.get<AnalyticsClientsNewVsRepeat>(
      `${basePath}/new-vs-repeat`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getRepeatFunnel: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsClientsRepeatFunnel> => {
    const { data } = await apiClient.get<AnalyticsClientsRepeatFunnel>(
      `${basePath}/repeat-funnel`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getReturnTiming: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsClientsReturnTiming> => {
    const { data } = await apiClient.get<AnalyticsClientsReturnTiming>(
      `${basePath}/return-timing`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getWinBack: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsClientsWinBack> => {
    const { data } = await apiClient.get<AnalyticsClientsWinBack>(
      `${basePath}/win-back`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },

  getTopValuable: async (
    params?: AnalyticsQueryParams,
    sort?: AnalyticsClientsTopValuableSort,
  ): Promise<AnalyticsClientsTopValuable> => {
    const query = {
      ...buildAnalyticsQuery(params),
      ...(sort ? { sort } : {}),
    };

    const { data } = await apiClient.get<AnalyticsClientsTopValuable>(
      `${basePath}/top-valuable`,
      {
        params: Object.keys(query).length > 0 ? query : undefined,
      },
    );

    return data;
  },

  getAcquisitionSources: async (
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsClientsAcquisitionSources> => {
    const { data } = await apiClient.get<AnalyticsClientsAcquisitionSources>(
      `${basePath}/acquisition-sources`,
      {
        params: buildAnalyticsQuery(params),
      },
    );

    return data;
  },
};
