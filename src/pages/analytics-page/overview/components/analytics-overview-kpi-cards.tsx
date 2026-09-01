import {
  ChartBarIcon,
  CreditCardIcon,
  PackageIcon,
  TagIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { AnalyticsKpi } from "@/features/analytics/model/analytics.types";

import {
  AnalyticsKpiCard,
  AnalyticsKpiCardsSkeleton,
} from "../../components/analytics-kpi-card";
import type { AnalyticsKpiValueFormat } from "../../utils/format-analytics-kpi-value";

import * as S from "./analytics-overview-kpi-cards.styled";

type AnalyticsOverviewKpiCardConfig = {
  key: keyof AnalyticsKpi;
  labelKey: string;
  valueFormat: AnalyticsKpiValueFormat;
  icon: ReactNode;
  dataQa: string;
};

const KPI_CARD_CONFIGS: readonly AnalyticsOverviewKpiCardConfig[] = [
  {
    key: "revenue",
    labelKey: "analytics.overview.kpi.revenue",
    valueFormat: "money",
    icon: <TagIcon />,
    dataQa: "analytics-overview-kpi-revenue",
  },
  {
    key: "grossProfit",
    labelKey: "analytics.overview.kpi.grossProfit",
    valueFormat: "money",
    icon: <ChartBarIcon />,
    dataQa: "analytics-overview-kpi-gross-profit",
  },
  {
    key: "orders",
    labelKey: "analytics.overview.kpi.orders",
    valueFormat: "number",
    icon: <PackageIcon />,
    dataQa: "analytics-overview-kpi-orders",
  },
  {
    key: "averageOrderValue",
    labelKey: "analytics.overview.kpi.averageOrderValue",
    valueFormat: "money",
    icon: <CreditCardIcon />,
    dataQa: "analytics-overview-kpi-average-order-value",
  },
  {
    key: "newClients",
    labelKey: "analytics.overview.kpi.newClients",
    valueFormat: "number",
    icon: <UserPlusIcon />,
    dataQa: "analytics-overview-kpi-new-clients",
  },
];

type AnalyticsOverviewKpiCardsProps = {
  kpi: AnalyticsKpi | null;
  loading?: boolean;
  showGrossProfit?: boolean;
};

export const AnalyticsOverviewKpiCards = ({
  kpi,
  loading = false,
  showGrossProfit = false,
}: AnalyticsOverviewKpiCardsProps) => {
  const { t } = useTranslation();
  const canShowGrossProfit = showGrossProfit && kpi?.grossProfit != null;
  const columns = showGrossProfit ? 5 : 4;
  const configs = KPI_CARD_CONFIGS.filter(
    (config) => config.key !== "grossProfit" || canShowGrossProfit,
  );

  if (loading && !kpi) {
    return (
      <S.Grid $columns={columns}>
        <AnalyticsKpiCardsSkeleton count={columns} />
      </S.Grid>
    );
  }

  if (!kpi) {
    return null;
  }

  return (
    <S.Grid $columns={canShowGrossProfit ? 5 : 4}>
      {configs.map((config) => {
        const metric = kpi[config.key];

        if (!metric) {
          return null;
        }

        return (
          <AnalyticsKpiCard
            key={config.key}
            metric={metric}
            label={t(config.labelKey)}
            icon={config.icon}
            valueFormat={config.valueFormat}
            dataQa={config.dataQa}
          />
        );
      })}
    </S.Grid>
  );
};
