import type { EChartsOption } from "echarts";

import type { AnalyticsRevenueChart } from "@/features/analytics/model/analytics.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { BRAND_PRIMARY } from "@/styled/brand";

export type RevenueChartTheme = {
  axisLabelColor: string;
  splitLineColor: string;
};

export function buildRevenueChartOptions(
  chart: AnalyticsRevenueChart,
  theme: RevenueChartTheme,
  seriesName: string,
): EChartsOption {
  const labels = chart.points.map((point) => point.label);
  const values = chart.points.map((point) => point.value);

  return {
    animationDuration: 500,
    grid: {
      left: 8,
      right: 16,
      top: 16,
      bottom: 8,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      confine: true,
      borderWidth: 0,
      padding: [8, 12],
      formatter: (params) => {
        const items = Array.isArray(params) ? params : [params];
        const first = items[0];

        if (!first || typeof first.dataIndex !== "number") {
          return "";
        }

        const label = labels[first.dataIndex] ?? "";
        const value = values[first.dataIndex] ?? 0;

        return `${label}<br/><strong>${formatMoney(value, "UAH")}</strong>`;
      },
    },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: theme.axisLabelColor,
        margin: 12,
      },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: {
        lineStyle: {
          color: theme.splitLineColor,
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: seriesName,
        type: "line",
        smooth: true,
        data: values,
        showSymbol: values.length <= 12,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          color: BRAND_PRIMARY,
          width: 2,
        },
        itemStyle: {
          color: "#ffffff",
          borderColor: BRAND_PRIMARY,
          borderWidth: 2,
        },
        emphasis: {
          focus: "series",
          itemStyle: {
            color: "#ffffff",
            borderColor: BRAND_PRIMARY,
            borderWidth: 2,
          },
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(110, 98, 205, 0.28)" },
              { offset: 1, color: "rgba(110, 98, 205, 0.03)" },
            ],
          },
        },
      },
    ],
  };
}
