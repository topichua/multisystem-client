import { Empty, Skeleton } from "antd";
import type { ReactNode } from "react";

import * as S from "./analytics-overview-report-card.styled";

type AnalyticsOverviewReportCardProps = {
  title: string;
  subtitle: string;
  dataQa: string;
  loading?: boolean;
  isEmpty?: boolean;
  chartHeight?: number;
  contentVariant?: "chart" | "list";
  headerAside?: ReactNode;
  children: ReactNode;
};

export const AnalyticsOverviewReportCard = ({
  title,
  subtitle,
  dataQa,
  loading = false,
  isEmpty = false,
  chartHeight = 280,
  contentVariant = "chart",
  headerAside,
  children,
}: AnalyticsOverviewReportCardProps) => (
  <S.Card data-qa={dataQa}>
    <S.Header>
      <S.HeaderCopy>
        <S.Title>{title}</S.Title>
        <S.Subtitle>{subtitle}</S.Subtitle>
      </S.HeaderCopy>
      {headerAside}
    </S.Header>

    {loading ? (
      <S.SkeletonWrap $height={contentVariant === "list" ? 240 : chartHeight}>
        <Skeleton
          active
          paragraph={{ rows: contentVariant === "list" ? 4 : 1 }}
        />
      </S.SkeletonWrap>
    ) : isEmpty ? (
      <S.SkeletonWrap $height={contentVariant === "list" ? 200 : chartHeight}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </S.SkeletonWrap>
    ) : contentVariant === "list" ? (
      <S.ListBody>{children}</S.ListBody>
    ) : (
      <S.ChartWrap $height={chartHeight}>{children}</S.ChartWrap>
    )}
  </S.Card>
);
