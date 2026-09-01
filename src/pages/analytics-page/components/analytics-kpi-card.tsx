import { InfoCircleOutlined } from "@ant-design/icons";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { Skeleton, Tooltip } from "antd";
import type { ReactNode } from "react";

import type { AnalyticsKpiMetric } from "@/features/analytics/model/analytics.types";

import {
  formatAnalyticsKpiChangePercent,
  formatAnalyticsKpiValue,
  getAnalyticsKpiChangeTone,
  type AnalyticsKpiValueFormat,
} from "../utils/format-analytics-kpi-value";

import * as S from "./analytics-kpi-cards.styled";

type AnalyticsKpiCardProps = {
  metric: AnalyticsKpiMetric;
  label: string;
  icon: ReactNode;
  valueFormat: AnalyticsKpiValueFormat;
  dataQa: string;
  hint?: string;
  scopeLabel?: string | null;
  formatDays?: (value: string) => string;
};

export const AnalyticsKpiCard = ({
  metric,
  label,
  icon,
  valueFormat,
  dataQa,
  hint,
  scopeLabel,
  formatDays,
}: AnalyticsKpiCardProps) => {
  const changeTone = getAnalyticsKpiChangeTone(metric.changePercent);

  return (
    <S.Card data-qa={dataQa}>
      <S.CardTop>
        <S.IconTile aria-hidden="true">{icon}</S.IconTile>
        <S.ChangeBadge $tone={changeTone}>
          {metric.changePercent == null ? (
            formatAnalyticsKpiChangePercent(null)
          ) : (
            <>
              {changeTone === "positive" ? (
                <CaretUpIcon weight="bold" />
              ) : (
                <CaretDownIcon weight="bold" />
              )}
              {formatAnalyticsKpiChangePercent(metric.changePercent)}
            </>
          )}
        </S.ChangeBadge>
      </S.CardTop>
      <S.Value>
        {formatAnalyticsKpiValue(metric, valueFormat, formatDays)}
      </S.Value>
      <S.LabelRow>
        <S.Label>{label}</S.Label>
        {hint ? (
          <Tooltip title={hint}>
            <S.InfoIcon aria-label={hint}>
              <InfoCircleOutlined />
            </S.InfoIcon>
          </Tooltip>
        ) : null}
      </S.LabelRow>
      {scopeLabel ? <S.ScopeBadge>{scopeLabel}</S.ScopeBadge> : null}
    </S.Card>
  );
};

type AnalyticsKpiCardsSkeletonProps = {
  count: number;
};

export const AnalyticsKpiCardsSkeleton = ({
  count,
}: AnalyticsKpiCardsSkeletonProps) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <S.SkeletonCard key={index}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </S.SkeletonCard>
    ))}
  </>
);
