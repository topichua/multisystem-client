import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import type { AnalyticsOrdersByStatus } from "@/features/analytics/model/analytics.types";

import {
  buildOrdersByStatusChartOptions,
  getOrdersByStatusChartHeight,
} from "../utils/build-orders-by-status-chart-options";

import { AnalyticsOverviewReportCard } from "./analytics-overview-report-card";

type AnalyticsOverviewOrdersByStatusChartProps = {
  data: AnalyticsOrdersByStatus | null;
  loading?: boolean;
};

export const AnalyticsOverviewOrdersByStatusChart = ({
  data,
  loading = false,
}: AnalyticsOverviewOrdersByStatusChartProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const chartHeight = useMemo(
    () => getOrdersByStatusChartHeight(data?.statuses.length ?? 0),
    [data?.statuses.length],
  );

  const chartTheme = useMemo(
    () => ({
      axisLabelColor: theme.colors.functional.text.subdued,
      valueLabelColor: theme.colors.functional.text.heading,
      trackColor: theme.colors.functional.background.hover,
      fallbackBarColor: theme.colors.semantic.primary,
    }),
    [theme],
  );

  const options = useMemo(() => {
    if (!data || data.statuses.length === 0) {
      return null;
    }

    return buildOrdersByStatusChartOptions({
      data,
      theme: chartTheme,
    });
  }, [chartTheme, data]);

  return (
    <AnalyticsOverviewReportCard
      title={t("analytics.overview.ordersByStatus.title")}
      subtitle={t("analytics.overview.ordersByStatus.subtitle")}
      dataQa="analytics-overview-orders-by-status-chart"
      loading={loading && !data}
      isEmpty={!options}
      chartHeight={chartHeight}
    >
      {options ? (
        <ReactECharts
          option={options}
          notMerge
          lazyUpdate
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      ) : null}
    </AnalyticsOverviewReportCard>
  );
};
