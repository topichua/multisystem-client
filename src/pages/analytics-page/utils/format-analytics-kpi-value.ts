import type { AnalyticsKpiMetric } from "@/features/analytics/model/analytics.types";
import { formatMoney } from "@/features/orders/utils/format-money";

export type AnalyticsKpiValueFormat = "money" | "number" | "percent" | "days";

export type AnalyticsKpiChangeTone = "positive" | "negative" | "neutral";

function formatNumber(value: number): string {
  return value.toLocaleString("uk-UA", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("uk-UA", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatAnalyticsKpiValue(
  metric: AnalyticsKpiMetric,
  format: AnalyticsKpiValueFormat,
  formatDays?: (value: string) => string,
): string {
  switch (format) {
    case "money":
      return formatMoney(metric.value, metric.currency ?? "UAH");
    case "percent":
      return formatPercent(metric.value);
    case "days": {
      const formatted = formatNumber(metric.value);

      return formatDays ? formatDays(formatted) : formatted;
    }
    default:
      return formatNumber(metric.value);
  }
}

export function formatAnalyticsKpiChangePercent(value: number | null): string {
  if (value == null) {
    return "—";
  }

  return `${Math.abs(value).toLocaleString("uk-UA", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function getAnalyticsKpiChangeTone(
  value: AnalyticsKpiMetric["changePercent"],
): AnalyticsKpiChangeTone {
  if (value == null) {
    return "neutral";
  }

  return value >= 0 ? "positive" : "negative";
}

function isAllTimeScope(scope: string): boolean {
  return scope === "all_time" || scope === "allTime" || scope === "lifetime";
}

export function getAnalyticsKpiScopeLabel(
  scope: string | undefined,
  allTimeLabel: string,
): string | null {
  if (!scope || scope === "period") {
    return null;
  }

  return isAllTimeScope(scope) ? allTimeLabel : scope;
}
