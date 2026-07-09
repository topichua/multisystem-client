export type AnalyticsKpiMetric = {
  value: number;
  changePercent: number;
  currency?: string;
};

export type AnalyticsKpi = {
  revenue: AnalyticsKpiMetric;
  orders: AnalyticsKpiMetric;
  averageOrderValue: AnalyticsKpiMetric;
  newClients: AnalyticsKpiMetric;
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
