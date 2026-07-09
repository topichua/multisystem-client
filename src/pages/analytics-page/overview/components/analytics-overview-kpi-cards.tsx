import {
  CaretDownIcon,
  CaretUpIcon,
  CreditCardIcon,
  PackageIcon,
  TagIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type {
  AnalyticsKpi,
  AnalyticsKpiMetric,
} from "@/features/analytics/model/analytics.types";

import {
  formatAnalyticsKpiChangePercent,
  formatAnalyticsKpiValue,
  isAnalyticsKpiChangePositive,
} from "../utils/format-analytics-kpi-value";

import * as S from "./analytics-overview-kpi-cards.styled";

type AnalyticsOverviewKpiCardProps = {
  metric: AnalyticsKpiMetric;
  label: string;
  icon: ReactNode;
  valueFormat: "money" | "number";
  dataQa: string;
};

const AnalyticsOverviewKpiCard = ({
  metric,
  label,
  icon,
  valueFormat,
  dataQa,
}: AnalyticsOverviewKpiCardProps) => {
  const positive = isAnalyticsKpiChangePositive(metric.changePercent);

  return (
    <S.Card data-qa={dataQa}>
      <S.CardTop>
        <S.IconTile aria-hidden="true">{icon}</S.IconTile>
        <S.ChangeBadge $positive={positive}>
          {positive ? (
            <CaretUpIcon weight="bold" />
          ) : (
            <CaretDownIcon weight="bold" />
          )}
          {formatAnalyticsKpiChangePercent(metric.changePercent)}
        </S.ChangeBadge>
      </S.CardTop>
      <S.Value>{formatAnalyticsKpiValue(metric, valueFormat)}</S.Value>
      <S.Label>{label}</S.Label>
    </S.Card>
  );
};

type AnalyticsOverviewKpiCardsProps = {
  kpi: AnalyticsKpi | null;
  loading?: boolean;
};

export const AnalyticsOverviewKpiCards = ({
  kpi,
  loading = false,
}: AnalyticsOverviewKpiCardsProps) => {
  const { t } = useTranslation();

  if (loading && !kpi) {
    return (
      <S.Grid>
        {Array.from({ length: 4 }, (_, index) => (
          <S.SkeletonCard key={index}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </S.SkeletonCard>
        ))}
      </S.Grid>
    );
  }

  if (!kpi) {
    return null;
  }

  return (
    <S.Grid>
      <AnalyticsOverviewKpiCard
        metric={kpi.revenue}
        label={t("analytics.overview.kpi.revenue")}
        icon={<TagIcon weight="duotone" />}
        valueFormat="money"
        dataQa="analytics-overview-kpi-revenue"
      />
      <AnalyticsOverviewKpiCard
        metric={kpi.orders}
        label={t("analytics.overview.kpi.orders")}
        icon={<PackageIcon weight="duotone" />}
        valueFormat="number"
        dataQa="analytics-overview-kpi-orders"
      />
      <AnalyticsOverviewKpiCard
        metric={kpi.averageOrderValue}
        label={t("analytics.overview.kpi.averageOrderValue")}
        icon={<CreditCardIcon weight="duotone" />}
        valueFormat="money"
        dataQa="analytics-overview-kpi-average-order-value"
      />
      <AnalyticsOverviewKpiCard
        metric={kpi.newClients}
        label={t("analytics.overview.kpi.newClients")}
        icon={<UserPlusIcon weight="duotone" />}
        valueFormat="number"
        dataQa="analytics-overview-kpi-new-clients"
      />
    </S.Grid>
  );
};
