import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import type { AnalyticsSalesChannels } from "@/features/analytics/model/analytics.types";

import { buildSalesChannelsChartOptions } from "../utils/build-sales-channels-chart-options";

import { AnalyticsOverviewReportCard } from "./analytics-overview-report-card";

type AnalyticsOverviewSalesChannelsChartProps = {
  data: AnalyticsSalesChannels | null;
  loading?: boolean;
};

export const AnalyticsOverviewSalesChannelsChart = ({
  data,
  loading = false,
}: AnalyticsOverviewSalesChannelsChartProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const chartTheme = useMemo(
    () => ({
      centerTitleColor: theme.colors.functional.text.heading,
      centerSubtitleColor: theme.colors.functional.text.subdued,
      legendTextColor: theme.colors.functional.text.primary,
    }),
    [theme],
  );

  const options = useMemo(() => {
    if (!data || data.channels.length === 0) {
      return null;
    }

    return buildSalesChannelsChartOptions({
      data,
      theme: chartTheme,
      ordersLabel: t("analytics.overview.salesChannels.ordersLabel"),
    });
  }, [chartTheme, data, t]);

  return (
    <AnalyticsOverviewReportCard
      title={t("analytics.overview.salesChannels.title")}
      subtitle={t("analytics.overview.salesChannels.subtitle")}
      dataQa="analytics-overview-sales-channels-chart"
      loading={loading && !data}
      isEmpty={!options}
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
