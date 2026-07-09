import type { EChartsOption } from "echarts";

import type { AnalyticsOrdersByStatus } from "@/features/analytics/model/analytics.types";
import { resolveAnalyticsStatusColor } from "@/features/analytics/utils/resolve-analytics-status-color";

export type OrdersByStatusChartTheme = {
  axisLabelColor: string;
  valueLabelColor: string;
  trackColor: string;
  fallbackBarColor: string;
};

type BuildOrdersByStatusChartOptionsParams = {
  data: AnalyticsOrdersByStatus;
  theme: OrdersByStatusChartTheme;
};

export function buildOrdersByStatusChartOptions({
  data,
  theme,
}: BuildOrdersByStatusChartOptionsParams): EChartsOption {
  const names = data.statuses.map((status) => status.name);
  const counts = data.statuses.map((status) => status.count);
  const colors = data.statuses.map((status) =>
    resolveAnalyticsStatusColor(status.color, theme.fallbackBarColor),
  );
  const maxCount = Math.max(...counts, 1);

  return {
    animationDuration: 500,
    grid: {
      left: 8,
      right: 48,
      top: 8,
      bottom: 8,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "none" },
      confine: true,
      formatter: (params) => {
        const items = Array.isArray(params) ? params : [params];
        const first = items[0];

        if (!first || typeof first.dataIndex !== "number") {
          return "";
        }

        const status = data.statuses[first.dataIndex];
        if (!status) {
          return "";
        }

        return `${status.name}<br/><strong>${status.count}</strong> (${status.percent}%)`;
      },
    },
    xAxis: {
      type: "value",
      max: maxCount,
      show: false,
    },
    yAxis: {
      type: "category",
      data: names,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: theme.axisLabelColor,
        width: 96,
        overflow: "truncate",
      },
    },
    series: [
      {
        type: "bar",
        data: counts,
        barWidth: 12,
        showBackground: true,
        backgroundStyle: {
          color: theme.trackColor,
          borderRadius: [0, 6, 6, 0],
        },
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: (params) => colors[params.dataIndex] ?? theme.fallbackBarColor,
        },
        emphasis: {
          itemStyle: {
            color: (params) =>
              colors[params.dataIndex] ?? theme.fallbackBarColor,
          },
        },
        label: {
          show: true,
          position: "right",
          color: theme.valueLabelColor,
          fontWeight: 600,
        },
      },
    ],
  };
}

export function getOrdersByStatusChartHeight(statusCount: number): number {
  return Math.max(280, statusCount * 36 + 24);
}
