import type { AnalyticsQueryParams } from "@/features/analytics/model/analytics.types";

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

export function buildAnalyticsQuery(
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
