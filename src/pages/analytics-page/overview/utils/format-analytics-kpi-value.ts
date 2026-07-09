import type { AnalyticsKpiMetric } from "@/features/analytics/model/analytics.types";
import { formatMoney } from "@/features/orders/utils/format-money";

export function formatAnalyticsKpiValue(
  metric: AnalyticsKpiMetric,
  format: "money" | "number",
): string {
  if (format === "money") {
    return formatMoney(metric.value, metric.currency ?? "UAH");
  }

  return metric.value.toLocaleString("uk-UA");
}

export function formatAnalyticsKpiChangePercent(value: number): string {
  return `${Math.abs(value).toLocaleString("uk-UA", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function isAnalyticsKpiChangePositive(value: number): boolean {
  return value >= 0;
}
