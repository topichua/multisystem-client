import { Empty, Skeleton } from "antd";
import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import type { AnalyticsRevenueChart } from "@/features/analytics/model/analytics.types";

import { buildRevenueChartOptions } from "../utils/build-revenue-chart-options";

import * as CardS from "./analytics-overview-report-card.styled";
import * as S from "./analytics-overview-revenue-chart.styled";

type AnalyticsOverviewRevenueChartProps = {
  chart: AnalyticsRevenueChart | null;
  periodLabel: string;
  loading?: boolean;
};

export const AnalyticsOverviewRevenueChart = ({
  chart,
  periodLabel,
  loading = false,
}: AnalyticsOverviewRevenueChartProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const seriesName = t("analytics.overview.revenueChart.legend");

  const chartTheme = useMemo(
    () => ({
      axisLabelColor: theme.colors.functional.text.subdued,
      splitLineColor: theme.colors.functional.border.split,
    }),
    [theme],
  );

  const options = useMemo(() => {
    if (!chart || chart.points.length === 0) {
      return null;
    }

    return buildRevenueChartOptions(chart, chartTheme, seriesName);
  }, [chart, chartTheme, seriesName]);

  return (
    <S.RevenueChartCard>
      <CardS.Header>
        <CardS.HeaderCopy>
          <CardS.Title>
            {t("analytics.overview.revenueChart.title")}
          </CardS.Title>
          <CardS.Subtitle>{periodLabel}</CardS.Subtitle>
        </CardS.HeaderCopy>
        <S.Legend aria-hidden="true">
          <S.LegendDot />
          <span>{seriesName}</span>
        </S.Legend>
      </CardS.Header>

      {loading && !chart ? (
        <CardS.SkeletonWrap>
          <Skeleton.Node active style={{ width: "100%", height: 240 }} />
        </CardS.SkeletonWrap>
      ) : options ? (
        <CardS.ChartWrap>
          <ReactECharts
            option={options}
            notMerge
            lazyUpdate
            style={{ width: "100%", height: "100%" }}
            opts={{ renderer: "canvas" }}
          />
        </CardS.ChartWrap>
      ) : (
        <CardS.SkeletonWrap>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </CardS.SkeletonWrap>
      )}
    </S.RevenueChartCard>
  );
};
