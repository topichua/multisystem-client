import type { EChartsOption } from "echarts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  characteristicsCoverage,
  conversationsByChannel,
  messageActivityHeatmap,
  monthlyClients,
  orderSources,
  ordersByStatus,
  responseTimeByWeekday,
  revenueTrend,
  salesByCategory,
  salesFunnel,
  stockHealthByCategory,
  teamOrdersHandled,
  topProducts,
} from "@/pages/analytics-page/mock/analytics-mock-data";

import { AnalyticsChartCard } from "./analytics-chart-card";
import { useAnalyticsChartTheme } from "./use-analytics-chart-theme";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(value);

const baseTooltip = (
  chartTheme: ReturnType<typeof useAnalyticsChartTheme>,
): NonNullable<EChartsOption["tooltip"]> => ({
  backgroundColor: chartTheme.tooltipBackground,
  borderColor: chartTheme.tooltipBorder,
  borderWidth: 1,
  textStyle: {
    color: chartTheme.headingColor,
    fontSize: 13,
  },
  extraCssText: "border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);",
});

export const AnalyticsCharts = () => {
  const { t } = useTranslation();
  const chartTheme = useAnalyticsChartTheme();

  const revenueTrendOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, splitLineColor, axisLineColor } = chartTheme;
    const palette = [...colors];

    return {
      color: palette,
      grid: { left: 12, right: 16, top: 24, bottom: 8, containLabel: true },
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "axis",
        axisPointer: { type: "cross", crossStyle: { color: textColor } },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: textColor },
        itemWidth: 12,
        itemHeight: 8,
        itemGap: 16,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: revenueTrend.days,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: t("analytics.charts.revenueTrend.ordersAxis"),
          nameTextStyle: { color: textColor, padding: [0, 0, 0, 0] },
          axisLabel: { color: textColor },
          splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
        },
        {
          type: "value",
          name: t("analytics.charts.revenueTrend.revenueAxis"),
          nameTextStyle: { color: textColor },
          axisLabel: {
            color: textColor,
            formatter: (value: number) => `${Math.round(value / 1000)}k`,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: t("analytics.charts.revenueTrend.ordersSeries"),
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 7,
          lineStyle: { width: 3, color: palette[0] },
          itemStyle: { color: palette[0], borderWidth: 2, borderColor: "#fff" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(110, 98, 205, 0.35)" },
                { offset: 1, color: "rgba(110, 98, 205, 0.02)" },
              ],
            },
          },
          data: revenueTrend.orders,
        },
        {
          name: t("analytics.charts.revenueTrend.revenueSeries"),
          type: "bar",
          yAxisIndex: 1,
          barMaxWidth: 28,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: palette[3] },
                { offset: 1, color: "rgba(87, 149, 238, 0.55)" },
              ],
            },
          },
          data: revenueTrend.revenue,
        },
      ],
    };
  }, [chartTheme, t]);

  const salesByCategoryOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, headingColor } = chartTheme;
    const palette = [...colors];
    const data = salesByCategory.map((item) => ({
      name: t(`analytics.mock.categories.${item.key}`),
      value: item.value,
    }));

    return {
      color: palette,
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "item",
        valueFormatter: (value) => formatCurrency(Number(value)),
      },
      legend: {
        orient: "vertical",
        right: 0,
        top: "middle",
        textStyle: { color: textColor },
        itemGap: 12,
      },
      series: [
        {
          type: "pie",
          radius: ["48%", "72%"],
          center: ["38%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: chartTheme.isDark ? "#151922" : "#fff",
            borderWidth: 3,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 600,
              color: headingColor,
            },
            scaleSize: 8,
          },
          data,
        },
      ],
    };
  }, [chartTheme, t]);

  const topProductsOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, splitLineColor } = chartTheme;
    const palette = [...colors];
    const labels = [...topProducts]
      .map((item) => t(`analytics.mock.products.${item.key}`))
      .reverse();
    const values = [...topProducts].map((item) => item.sales).reverse();

    return {
      color: palette,
      grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "value",
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, width: 120, overflow: "truncate" },
      },
      series: [
        {
          type: "bar",
          data: values,
          barMaxWidth: 18,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: (params) =>
              palette[params.dataIndex % palette.length] ?? palette[0],
          },
          label: {
            show: true,
            position: "right",
            color: textColor,
            formatter: "{c}",
          },
        },
      ],
    };
  }, [chartTheme, t]);

  const ordersByStatusOption = useMemo<EChartsOption>(() => {
    const { colors, textColor } = chartTheme;
    const palette = [...colors];
    const data = ordersByStatus.map((item) => ({
      name: t(`analytics.mock.orderStatuses.${item.key}`),
      value: item.value,
    }));

    return {
      color: palette,
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "item",
      },
      legend: {
        bottom: 0,
        textStyle: { color: textColor },
        itemGap: 14,
      },
      series: [
        {
          type: "pie",
          radius: "68%",
          center: ["50%", "44%"],
          roseType: "radius",
          itemStyle: {
            borderRadius: 6,
            borderColor: chartTheme.isDark ? "#151922" : "#fff",
            borderWidth: 2,
          },
          label: {
            color: textColor,
            formatter: "{b}\n{d}%",
          },
          data,
        },
      ],
    };
  }, [chartTheme, t]);

  const conversationsOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, splitLineColor, axisLineColor } = chartTheme;
    const palette = [...colors];

    return {
      color: palette,
      grid: { left: 12, right: 12, top: 16, bottom: 8, containLabel: true },
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "category",
        data: conversationsByChannel.map((item) =>
          t(`analytics.mock.channels.${item.key}`),
        ),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
      },
      series: [
        {
          type: "bar",
          data: conversationsByChannel.map((item) => item.value),
          barMaxWidth: 42,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: (params) => {
              const channelPalette = [
                palette[0],
                palette[4],
                palette[5],
                palette[2],
              ];
              return (
                channelPalette[params.dataIndex % channelPalette.length] ??
                palette[0]
              );
            },
          },
        },
      ],
    };
  }, [chartTheme, t]);

  const characteristicsOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, splitLineColor } = chartTheme;
    const palette = [...colors];
    const indicators = characteristicsCoverage.map((item) => ({
      name: t(`analytics.mock.characteristics.${item.key}`),
      max: 100,
    }));
    const values = characteristicsCoverage.map((item) =>
      Math.round((item.filled / item.total) * 100),
    );

    return {
      color: palette,
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "item",
      },
      radar: {
        radius: "62%",
        center: ["50%", "52%"],
        splitNumber: 4,
        axisName: { color: textColor, fontSize: 12 },
        splitLine: { lineStyle: { color: splitLineColor } },
        splitArea: {
          show: true,
          areaStyle: {
            color: chartTheme.isDark
              ? ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.04)"]
              : ["rgba(110,98,205,0.03)", "rgba(110,98,205,0.06)"],
          },
        },
        indicator: indicators,
      },
      series: [
        {
          type: "radar",
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2, color: palette[0] },
          areaStyle: {
            color: "rgba(110, 98, 205, 0.22)",
          },
          itemStyle: { color: palette[0] },
          data: [
            {
              name: t("analytics.charts.characteristics.series"),
              value: values,
            },
          ],
        },
      ],
    };
  }, [chartTheme, t]);

  const salesFunnelOption = useMemo<EChartsOption>(() => {
    const { colors, textColor } = chartTheme;
    const palette = [...colors];
    const data = salesFunnel.map((item) => ({
      name: t(`analytics.mock.funnel.${item.key}`),
      value: item.value,
    }));

    return {
      color: palette,
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "item",
      },
      series: [
        {
          type: "funnel",
          left: "8%",
          top: 16,
          bottom: 16,
          width: "84%",
          min: 0,
          max: salesFunnel[0]?.value ?? 100,
          minSize: "12%",
          maxSize: "100%",
          sort: "descending",
          gap: 4,
          label: {
            show: true,
            position: "inside",
            color: "#fff",
            fontSize: 13,
            formatter: "{b}\n{c}",
          },
          itemStyle: {
            borderColor: chartTheme.isDark ? "#151922" : "#fff",
            borderWidth: 2,
          },
          data,
        },
      ],
      legend: {
        bottom: 0,
        textStyle: { color: textColor },
      },
    };
  }, [chartTheme, t]);

  const monthlyClientsOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, splitLineColor, axisLineColor } = chartTheme;
    const palette = [...colors];
    const months = monthlyClients.months.map((key) =>
      t(`analytics.mock.months.${key}`),
    );

    return {
      color: palette,
      grid: { left: 12, right: 12, top: 32, bottom: 8, containLabel: true },
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "axis",
        axisPointer: { type: "line" },
      },
      legend: {
        top: 0,
        textStyle: { color: textColor },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: months,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
      },
      series: [
        {
          name: t("analytics.charts.monthlyClients.newSeries"),
          type: "line",
          stack: "clients",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          areaStyle: { opacity: 0.35 },
          data: monthlyClients.newClients,
        },
        {
          name: t("analytics.charts.monthlyClients.returningSeries"),
          type: "line",
          stack: "clients",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          areaStyle: { opacity: 0.35 },
          data: monthlyClients.returningClients,
        },
      ],
    };
  }, [chartTheme, t]);

  const stockHealthOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, splitLineColor } = chartTheme;
    const palette = [...colors];
    const categories = stockHealthByCategory.map((item) =>
      t(`analytics.mock.categories.${item.key}`),
    );

    return {
      color: [palette[2], palette[6], palette[5]],
      grid: { left: 8, right: 16, top: 32, bottom: 8, containLabel: true },
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        top: 0,
        textStyle: { color: textColor },
      },
      xAxis: {
        type: "value",
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor },
      },
      series: [
        {
          name: t("analytics.charts.stockHealth.inStock"),
          type: "bar",
          stack: "stock",
          barMaxWidth: 20,
          itemStyle: { borderRadius: [0, 0, 0, 0] },
          data: stockHealthByCategory.map((item) => item.inStock),
        },
        {
          name: t("analytics.charts.stockHealth.lowStock"),
          type: "bar",
          stack: "stock",
          barMaxWidth: 20,
          data: stockHealthByCategory.map((item) => item.lowStock),
        },
        {
          name: t("analytics.charts.stockHealth.outOfStock"),
          type: "bar",
          stack: "stock",
          barMaxWidth: 20,
          itemStyle: { borderRadius: [0, 6, 6, 0] },
          data: stockHealthByCategory.map((item) => item.outOfStock),
        },
      ],
    };
  }, [chartTheme, t]);

  const responseTimeOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, splitLineColor, axisLineColor } = chartTheme;
    const palette = [...colors];

    return {
      color: palette,
      grid: { left: 12, right: 16, top: 16, bottom: 8, containLabel: true },
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "axis",
        valueFormatter: (value) =>
          `${value} ${t("analytics.charts.responseTime.unit")}`,
      },
      xAxis: {
        type: "category",
        data: responseTimeByWeekday.map((item) =>
          t(`analytics.mock.weekdays.${item.key}`),
        ),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        name: t("analytics.charts.responseTime.axis"),
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
      },
      series: [
        {
          type: "line",
          smooth: true,
          symbol: "emptyCircle",
          symbolSize: 8,
          lineStyle: { width: 3, color: palette[4] },
          itemStyle: { color: palette[4] },
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { type: "dashed", color: splitLineColor },
            label: { color: textColor, formatter: "{b}" },
            data: [
              {
                type: "average",
                name: t("analytics.charts.responseTime.average"),
              },
            ],
          },
          data: responseTimeByWeekday.map((item) => item.minutes),
        },
      ],
    };
  }, [chartTheme, t]);

  const orderSourcesOption = useMemo<EChartsOption>(() => {
    const { colors, textColor } = chartTheme;
    const palette = [...colors];
    const data = orderSources.map((item) => ({
      name: t(`analytics.mock.orderSources.${item.key}`),
      value: item.value,
    }));

    return {
      color: palette,
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        right: 0,
        top: "middle",
        textStyle: { color: textColor },
        itemGap: 10,
      },
      series: [
        {
          type: "pie",
          radius: [20, "68%"],
          center: ["38%", "50%"],
          roseType: "area",
          itemStyle: {
            borderRadius: 8,
            borderColor: chartTheme.isDark ? "#151922" : "#fff",
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 600,
            },
          },
          data,
        },
      ],
    };
  }, [chartTheme, t]);

  const teamPerformanceOption = useMemo<EChartsOption>(() => {
    const { colors, textColor, splitLineColor } = chartTheme;
    const palette = [...colors];
    const labels = [...teamOrdersHandled]
      .map((item) => t(`analytics.mock.teamMembers.${item.key}`))
      .reverse();
    const values = [...teamOrdersHandled].map((item) => item.orders).reverse();

    return {
      color: palette,
      grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
      tooltip: {
        ...baseTooltip(chartTheme),
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "value",
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: splitLineColor, type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor },
      },
      series: [
        {
          type: "bar",
          data: values,
          barMaxWidth: 16,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: palette[0] },
                { offset: 1, color: palette[1] },
              ],
            },
          },
          label: {
            show: true,
            position: "right",
            color: textColor,
          },
        },
      ],
    };
  }, [chartTheme, t]);

  const messageHeatmapOption = useMemo<EChartsOption>(() => {
    const { textColor, splitLineColor } = chartTheme;
    const days = messageActivityHeatmap.days.map((key) =>
      t(`analytics.mock.weekdaysShort.${key}`),
    );
    const maxValue = Math.max(
      ...messageActivityHeatmap.values.map((item) => item[2]),
    );

    return {
      grid: { left: 48, right: 24, top: 16, bottom: 48, containLabel: true },
      tooltip: {
        ...baseTooltip(chartTheme),
        position: "top",
        formatter: (params) => {
          if (!params || Array.isArray(params)) return "";
          const raw = params.value;
          if (!Array.isArray(raw) || raw.length < 3) return "";
          const hourIndex = Number(raw[0]);
          const dayIndex = Number(raw[1]);
          const count = raw[2];
          const hour = messageActivityHeatmap.hours[hourIndex] ?? "";
          const day = days[dayIndex] ?? "";
          return `${day}, ${hour}:00<br/><b>${count}</b> ${t("analytics.charts.messageHeatmap.unit")}`;
        },
      },
      xAxis: {
        type: "category",
        data: messageActivityHeatmap.hours.map((hour) => `${hour}:00`),
        splitArea: { show: true },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor },
      },
      yAxis: {
        type: "category",
        data: days,
        splitArea: { show: true },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        textStyle: { color: textColor },
        inRange: {
          color: ["#f4f1ff", "#b8aef0", "#6e62cd", "#4c1d90"],
        },
      },
      series: [
        {
          type: "heatmap",
          data: messageActivityHeatmap.values,
          label: { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 8,
              shadowColor: "rgba(0,0,0,0.2)",
            },
          },
          itemStyle: {
            borderColor: splitLineColor,
            borderWidth: 2,
            borderRadius: 4,
          },
        },
      ],
    };
  }, [chartTheme, t]);

  return (
    <>
      <AnalyticsChartCard
        span="full"
        title={t("analytics.charts.revenueTrend.title")}
        subtitle={t("analytics.charts.revenueTrend.subtitle")}
        option={revenueTrendOption}
        height={320}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.salesByCategory.title")}
        subtitle={t("analytics.charts.salesByCategory.subtitle")}
        option={salesByCategoryOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.topProducts.title")}
        subtitle={t("analytics.charts.topProducts.subtitle")}
        option={topProductsOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.ordersByStatus.title")}
        subtitle={t("analytics.charts.ordersByStatus.subtitle")}
        option={ordersByStatusOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.conversations.title")}
        subtitle={t("analytics.charts.conversations.subtitle")}
        option={conversationsOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.characteristics.title")}
        subtitle={t("analytics.charts.characteristics.subtitle")}
        option={characteristicsOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.salesFunnel.title")}
        subtitle={t("analytics.charts.salesFunnel.subtitle")}
        option={salesFunnelOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.monthlyClients.title")}
        subtitle={t("analytics.charts.monthlyClients.subtitle")}
        option={monthlyClientsOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.stockHealth.title")}
        subtitle={t("analytics.charts.stockHealth.subtitle")}
        option={stockHealthOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.responseTime.title")}
        subtitle={t("analytics.charts.responseTime.subtitle")}
        option={responseTimeOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.orderSources.title")}
        subtitle={t("analytics.charts.orderSources.subtitle")}
        option={orderSourcesOption}
      />
      <AnalyticsChartCard
        title={t("analytics.charts.teamPerformance.title")}
        subtitle={t("analytics.charts.teamPerformance.subtitle")}
        option={teamPerformanceOption}
        span="full"
      />
      <AnalyticsChartCard
        span="full"
        title={t("analytics.charts.messageHeatmap.title")}
        subtitle={t("analytics.charts.messageHeatmap.subtitle")}
        option={messageHeatmapOption}
        height={340}
      />
    </>
  );
};
