import dayjs from "dayjs";
import { makeAutoObservable, runInAction } from "mobx";

import { analyticsApi } from "@/features/analytics/api/analytics-api";
import {
  DEFAULT_ANALYTICS_PERIOD,
  type AnalyticsDateFilterMode,
  type AnalyticsPeriodPreset,
} from "@/features/analytics/model/analytics-period.constants";
import type {
  AnalyticsKpi,
  AnalyticsOrdersByStatus,
  AnalyticsQueryParams,
  AnalyticsRevenueChart,
  AnalyticsSalesChannels,
  AnalyticsTopCustomers,
  AnalyticsTopProducts,
} from "@/features/analytics/model/analytics.types";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

function toApiIsoDateStart(value: string): string {
  return dayjs(value).startOf("day").toISOString();
}

function toApiIsoDateEnd(value: string): string {
  return dayjs(value).endOf("day").toISOString();
}

type LoadResourceConfig<T> = {
  silent?: boolean;
  fetch: () => Promise<T>;
  setData: (data: T) => void;
  clearData: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  errorMessage: string;
};

export class AnalyticsStore {
  dateFilterMode: AnalyticsDateFilterMode = "preset";
  period: AnalyticsPeriodPreset = DEFAULT_ANALYTICS_PERIOD;
  dateFrom: string | null = null;
  dateTo: string | null = null;
  channelIds: number[] = [];
  managerIds: number[] = [];
  orderStatusIds: number[] = [];
  productIds: number[] = [];
  categoryIds: number[] = [];
  clientTags: string[] = [];
  instagramAccounts: string[] = [];

  kpi: AnalyticsKpi | null = null;
  revenueChart: AnalyticsRevenueChart | null = null;
  salesChannels: AnalyticsSalesChannels | null = null;
  ordersByStatus: AnalyticsOrdersByStatus | null = null;
  topProducts: AnalyticsTopProducts | null = null;
  topCustomers: AnalyticsTopCustomers | null = null;

  kpiLoading = false;
  kpiError: string | null = null;

  revenueChartLoading = false;
  revenueChartError: string | null = null;

  salesChannelsLoading = false;
  salesChannelsError: string | null = null;

  ordersByStatusLoading = false;
  ordersByStatusError: string | null = null;

  topProductsLoading = false;
  topProductsError: string | null = null;

  topCustomersLoading = false;
  topCustomersError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  private loadResource = async <T>(
    config: LoadResourceConfig<T>,
  ): Promise<void> => {
    const silent = config.silent === true;

    if (!silent) {
      runInAction(() => {
        config.setLoading(true);
        config.setError(null);
      });
    }

    try {
      const data = await config.fetch();
      runInAction(() => {
        config.setData(data);
      });
    } catch (e) {
      runInAction(() => {
        config.setError(unknownErrorMessage(e));
        config.clearData();
      });
      throwLoadError(config.errorMessage, e);
    } finally {
      if (!silent) {
        runInAction(() => {
          config.setLoading(false);
        });
      }
    }
  };

  private buildQueryParams(): AnalyticsQueryParams {
    const dateParams =
      this.dateFilterMode === "custom" && this.dateFrom && this.dateTo
        ? { dateFrom: this.dateFrom, dateTo: this.dateTo }
        : { period: this.period };

    return {
      ...dateParams,
      ...(this.channelIds.length ? { channelIds: [...this.channelIds] } : {}),
      ...(this.managerIds.length ? { managerIds: [...this.managerIds] } : {}),
      ...(this.orderStatusIds.length
        ? { orderStatusIds: [...this.orderStatusIds] }
        : {}),
      ...(this.productIds.length ? { productIds: [...this.productIds] } : {}),
      ...(this.categoryIds.length
        ? { categoryIds: [...this.categoryIds] }
        : {}),
      ...(this.clientTags.length ? { clientTags: [...this.clientTags] } : {}),
      ...(this.instagramAccounts.length
        ? { instagramAccounts: [...this.instagramAccounts] }
        : {}),
    };
  }

  setPeriodPreset = (value: AnalyticsPeriodPreset): void => {
    runInAction(() => {
      this.dateFilterMode = "preset";
      this.period = value;
      this.dateFrom = null;
      this.dateTo = null;
    });
  };

  setCustomDateRange = (
    dateFrom: string | null,
    dateTo: string | null,
  ): void => {
    runInAction(() => {
      if (dateFrom && dateTo) {
        this.dateFilterMode = "custom";
        this.dateFrom = toApiIsoDateStart(dateFrom);
        this.dateTo = toApiIsoDateEnd(dateTo);
        return;
      }

      this.dateFilterMode = "preset";
      this.period = DEFAULT_ANALYTICS_PERIOD;
      this.dateFrom = null;
      this.dateTo = null;
    });
  };

  applyPeriodPreset = async (value: AnalyticsPeriodPreset): Promise<void> => {
    this.setPeriodPreset(value);
    await this.loadOverview();
  };

  applyCustomDateRange = async (
    dateFrom: string | null,
    dateTo: string | null,
  ): Promise<void> => {
    this.setCustomDateRange(dateFrom, dateTo);
    await this.loadOverview();
  };

  setChannelIds = (ids: number[]): void => {
    runInAction(() => {
      this.channelIds = [...new Set(ids)];
    });
  };

  setManagerIds = (ids: number[]): void => {
    runInAction(() => {
      this.managerIds = [...new Set(ids)];
    });
  };

  setOrderStatusIds = (ids: number[]): void => {
    runInAction(() => {
      this.orderStatusIds = [...new Set(ids)];
    });
  };

  setProductIds = (ids: number[]): void => {
    runInAction(() => {
      this.productIds = [...new Set(ids)];
    });
  };

  setCategoryIds = (ids: number[]): void => {
    runInAction(() => {
      this.categoryIds = [...new Set(ids)];
    });
  };

  setClientTags = (tags: string[]): void => {
    runInAction(() => {
      this.clientTags = [
        ...new Set(tags.map((tag) => tag.trim()).filter(Boolean)),
      ];
    });
  };

  setInstagramAccounts = (accounts: string[]): void => {
    runInAction(() => {
      this.instagramAccounts = [
        ...new Set(accounts.map((account) => account.trim()).filter(Boolean)),
      ];
    });
  };

  resetFilters = (): void => {
    runInAction(() => {
      this.dateFilterMode = "preset";
      this.period = DEFAULT_ANALYTICS_PERIOD;
      this.dateFrom = null;
      this.dateTo = null;
      this.channelIds = [];
      this.managerIds = [];
      this.orderStatusIds = [];
      this.productIds = [];
      this.categoryIds = [];
      this.clientTags = [];
      this.instagramAccounts = [];
    });
  };

  loadOverview = async (options?: { silent?: boolean }): Promise<void> => {
    await Promise.all([
      this.loadKpi(options),
      this.loadRevenueChart(options),
      this.loadSalesChannels(options),
      this.loadOrdersByStatus(options),
      this.loadTopProducts(options),
      this.loadTopCustomers(options),
    ]);
  };

  loadKpi = async (options?: { silent?: boolean }): Promise<void> => {
    await this.loadResource({
      silent: options?.silent,
      fetch: () => analyticsApi.getKpi(this.buildQueryParams()),
      setData: (data) => {
        this.kpi = data;
      },
      clearData: () => {
        this.kpi = null;
      },
      setError: (error) => {
        this.kpiError = error;
      },
      setLoading: (loading) => {
        this.kpiLoading = loading;
      },
      errorMessage: "Failed to load analytics KPI",
    });
  };

  loadRevenueChart = async (options?: { silent?: boolean }): Promise<void> => {
    await this.loadResource({
      silent: options?.silent,
      fetch: () => analyticsApi.getRevenueChart(this.buildQueryParams()),
      setData: (data) => {
        this.revenueChart = data;
      },
      clearData: () => {
        this.revenueChart = null;
      },
      setError: (error) => {
        this.revenueChartError = error;
      },
      setLoading: (loading) => {
        this.revenueChartLoading = loading;
      },
      errorMessage: "Failed to load analytics revenue chart",
    });
  };

  loadSalesChannels = async (options?: { silent?: boolean }): Promise<void> => {
    await this.loadResource({
      silent: options?.silent,
      fetch: () => analyticsApi.getSalesChannels(this.buildQueryParams()),
      setData: (data) => {
        this.salesChannels = data;
      },
      clearData: () => {
        this.salesChannels = null;
      },
      setError: (error) => {
        this.salesChannelsError = error;
      },
      setLoading: (loading) => {
        this.salesChannelsLoading = loading;
      },
      errorMessage: "Failed to load analytics sales channels",
    });
  };

  loadOrdersByStatus = async (options?: {
    silent?: boolean;
  }): Promise<void> => {
    await this.loadResource({
      silent: options?.silent,
      fetch: () => analyticsApi.getOrdersByStatus(this.buildQueryParams()),
      setData: (data) => {
        this.ordersByStatus = data;
      },
      clearData: () => {
        this.ordersByStatus = null;
      },
      setError: (error) => {
        this.ordersByStatusError = error;
      },
      setLoading: (loading) => {
        this.ordersByStatusLoading = loading;
      },
      errorMessage: "Failed to load analytics orders by status",
    });
  };

  loadTopProducts = async (options?: { silent?: boolean }): Promise<void> => {
    await this.loadResource({
      silent: options?.silent,
      fetch: () => analyticsApi.getTopProducts(this.buildQueryParams()),
      setData: (data) => {
        this.topProducts = data;
      },
      clearData: () => {
        this.topProducts = null;
      },
      setError: (error) => {
        this.topProductsError = error;
      },
      setLoading: (loading) => {
        this.topProductsLoading = loading;
      },
      errorMessage: "Failed to load analytics top products",
    });
  };

  loadTopCustomers = async (options?: { silent?: boolean }): Promise<void> => {
    await this.loadResource({
      silent: options?.silent,
      fetch: () => analyticsApi.getTopCustomers(this.buildQueryParams()),
      setData: (data) => {
        this.topCustomers = data;
      },
      clearData: () => {
        this.topCustomers = null;
      },
      setError: (error) => {
        this.topCustomersError = error;
      },
      setLoading: (loading) => {
        this.topCustomersLoading = loading;
      },
      errorMessage: "Failed to load analytics top customers",
    });
  };
}
