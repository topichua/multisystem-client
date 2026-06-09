import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { ReactNode } from "react";

import {
  ChartCard,
  ChartCardHeader,
  ChartCardSubtitle,
  ChartCardTitle,
  ChartContainer,
} from "@/pages/analytics-page/analytics-page.styled";

type AnalyticsChartCardProps = {
  title: string;
  subtitle: string;
  option: EChartsOption;
  span?: "default" | "full";
  height?: number;
  footer?: ReactNode;
};

export const AnalyticsChartCard = ({
  title,
  subtitle,
  option,
  span = "default",
  height = 280,
  footer,
}: AnalyticsChartCardProps) => (
  <ChartCard $span={span} bordered={false}>
    <ChartCardHeader>
      <ChartCardTitle>{title}</ChartCardTitle>
      <ChartCardSubtitle>{subtitle}</ChartCardSubtitle>
    </ChartCardHeader>
    <ChartContainer style={{ height }}>
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "svg" }}
        notMerge
        lazyUpdate
      />
    </ChartContainer>
    {footer}
  </ChartCard>
);
