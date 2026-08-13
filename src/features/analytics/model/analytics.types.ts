export type AnalyticsKpiMetric = {
  value: number;
  changePercent: number | null;
  currency?: string;
  scope?: string;
};

export type AnalyticsKpi = {
  revenue: AnalyticsKpiMetric;
  orders: AnalyticsKpiMetric;
  averageOrderValue: AnalyticsKpiMetric;
  newClients: AnalyticsKpiMetric;
};

export type AnalyticsClientsKpi = {
  activeClients: AnalyticsKpiMetric;
  newClients: AnalyticsKpiMetric;
  repeatPurchaseRate: AnalyticsKpiMetric;
  averageCustomerValue: AnalyticsKpiMetric;
  ordersPerClient: AnalyticsKpiMetric;
  timeToRepurchaseDays: AnalyticsKpiMetric;
};

export type AnalyticsClientsNewVsRepeatSegment = {
  key: string;
  clients: number;
  revenue: number;
  revenuePercent: number;
};

export type AnalyticsClientsNewVsRepeat = {
  currency: string;
  totalRevenue: number;
  segments: AnalyticsClientsNewVsRepeatSegment[];
};

export type AnalyticsClientsRepeatFunnelStep = {
  key: string;
  minOrders: number;
  clients: number;
  percent: number;
};

export type AnalyticsClientsRepeatFunnel = {
  steps: AnalyticsClientsRepeatFunnelStep[];
};

export type AnalyticsClientsReturnTimingBucket = {
  key: string;
  clients: number;
  percent: number;
};

export type AnalyticsClientsReturnTiming = {
  buckets: AnalyticsClientsReturnTimingBucket[];
};

export type AnalyticsClientsWinBackBucket = {
  key: string;
  clients: number;
};

export type AnalyticsClientsWinBack = {
  buckets: AnalyticsClientsWinBackBucket[];
  totalClients: number;
};

export type AnalyticsClientsTopValuableCustomer = {
  clientId: number;
  name: string;
  avatar: string | null;
  orders: number;
  periodRevenue: number;
  lastPurchase: string | null;
  lifetimeValue: number;
  periodGrossProfit: number;
};

export type AnalyticsClientsTopValuableSort =
  "lifetimeValue" | "periodRevenue" | "orders" | "lastPurchase";

export type AnalyticsClientsTopValuable = {
  currency: string;
  sort: AnalyticsClientsTopValuableSort;
  customers: AnalyticsClientsTopValuableCustomer[];
};

export type AnalyticsClientsAcquisitionSource = {
  source: string;
  name: string;
  clients: number;
  percent: number;
};

export type AnalyticsClientsAcquisitionSources = {
  totalNewClients: number;
  sources: AnalyticsClientsAcquisitionSource[];
};

export type AnalyticsRevenueChartPoint = {
  label: string;
  dateFrom: string;
  dateTo: string;
  value: number;
};

export type AnalyticsRevenueChart = {
  points: AnalyticsRevenueChartPoint[];
};

export type AnalyticsSalesChannel = {
  name: string;
  orders: number;
  percent: number;
};

export type AnalyticsSalesChannels = {
  totalOrders: number;
  channels: AnalyticsSalesChannel[];
};

export type AnalyticsOrderByStatus = {
  statusId: number;
  name: string;
  color: string;
  count: number;
  percent: number;
};

export type AnalyticsOrdersByStatus = {
  statuses: AnalyticsOrderByStatus[];
};

export type AnalyticsTopProduct = {
  productId: number;
  variantId: number;
  name: string;
  image: string | null;
  revenue: number;
  soldQuantity: number;
};

export type AnalyticsTopProducts = {
  products: AnalyticsTopProduct[];
};

export type AnalyticsTopCustomer = {
  clientId: number;
  name: string;
  avatar: string | null;
  orders: number;
  spent: number;
};

export type AnalyticsTopCustomers = {
  customers: AnalyticsTopCustomer[];
};

export type AnalyticsQueryParams = {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  channelIds?: number[];
  managerIds?: number[];
  orderStatusIds?: number[];
  productIds?: number[];
  categoryIds?: number[];
  clientTags?: string[];
  instagramAccounts?: string[];
};
