import type { EChartsOption } from "echarts";

import type { AnalyticsSalesChannels } from "@/features/analytics/model/analytics.types";

const SALES_CHANNEL_COLORS = [
  "#E4405F",
  "#2AABEE",
  "#8B93B4",
  "#6E62CD",
  "#2372E2",
  "#2DA68B",
  "#DEA838",
  "#D23F57",
] as const;

export type SalesChannelsChartTheme = {
  centerTitleColor: string;
  centerSubtitleColor: string;
  legendTextColor: string;
};

type BuildSalesChannelsChartOptionsParams = {
  data: AnalyticsSalesChannels;
  theme: SalesChannelsChartTheme;
  ordersLabel: string;
};

export function buildSalesChannelsChartOptions({
  data,
  theme,
  ordersLabel,
}: BuildSalesChannelsChartOptionsParams): EChartsOption {
  const seriesData = data.channels.map((channel, index) => ({
    name: channel.name,
    value: channel.orders,
    percent: channel.percent,
    itemStyle: {
      color: SALES_CHANNEL_COLORS[index % SALES_CHANNEL_COLORS.length],
    },
  }));

  return {
    animationDuration: 500,
    tooltip: {
      trigger: "item",
      confine: true,
      formatter: (params) => {
        if (!params || typeof params !== "object" || !("name" in params)) {
          return "";
        }

        const channel = data.channels.find(
          (item) => item.name === String(params.name),
        );

        if (!channel) {
          return String(params.name);
        }

        return `${channel.name}<br/>${channel.orders} (${channel.percent}%)`;
      },
    },
    legend: {
      orient: "vertical",
      right: 0,
      top: "middle",
      icon: "roundRect",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: {
        color: theme.legendTextColor,
        fontSize: 13,
      },
      formatter: (name) => {
        const channel = data.channels.find((item) => item.name === name);
        return channel ? `${name}  ${channel.percent}%` : name;
      },
    },
    title: [
      {
        text: data.totalOrders.toLocaleString("uk-UA"),
        left: "31%",
        top: "42%",
        textAlign: "center",
        textStyle: {
          color: theme.centerTitleColor,
          fontSize: 28,
          fontWeight: 600,
        },
      },
      {
        text: ordersLabel,
        left: "31%",
        top: "54%",
        textAlign: "center",
        textStyle: {
          color: theme.centerSubtitleColor,
          fontSize: 13,
          fontWeight: 400,
        },
      },
    ],
    series: [
      {
        type: "pie",
        radius: ["58%", "78%"],
        center: ["32%", "50%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: seriesData,
      },
    ],
  };
}
