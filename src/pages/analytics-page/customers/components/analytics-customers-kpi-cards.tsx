import {
  ClockIcon,
  CreditCardIcon,
  CubeIcon,
  HeartIcon,
  UserPlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { AnalyticsClientsKpi } from "@/features/analytics/model/analytics.types";

import {
  AnalyticsKpiCard,
  AnalyticsKpiCardsSkeleton,
} from "../../components/analytics-kpi-card";
import {
  getAnalyticsKpiScopeLabel,
  type AnalyticsKpiValueFormat,
} from "../../utils/format-analytics-kpi-value";

import * as S from "./analytics-customers-kpi-cards.styled";

type AnalyticsCustomersKpiCardConfig = {
  key: keyof AnalyticsClientsKpi;
  labelKey: string;
  hintKey: string;
  valueFormat: AnalyticsKpiValueFormat;
  icon: ReactNode;
  dataQa: string;
};

const KPI_CARD_CONFIGS: readonly AnalyticsCustomersKpiCardConfig[] = [
  {
    key: "activeClients",
    labelKey: "analytics.customers.kpi.activeClients",
    hintKey: "analytics.customers.kpi.hints.activeClients",
    valueFormat: "number",
    icon: <UsersThreeIcon />,
    dataQa: "analytics-customers-kpi-active-clients",
  },
  {
    key: "newClients",
    labelKey: "analytics.customers.kpi.newClients",
    hintKey: "analytics.customers.kpi.hints.newClients",
    valueFormat: "number",
    icon: <UserPlusIcon />,
    dataQa: "analytics-customers-kpi-new-clients",
  },
  {
    key: "repeatPurchaseRate",
    labelKey: "analytics.customers.kpi.repeatPurchaseRate",
    hintKey: "analytics.customers.kpi.hints.repeatPurchaseRate",
    valueFormat: "percent",
    icon: <HeartIcon />,
    dataQa: "analytics-customers-kpi-repeat-purchase-rate",
  },
  {
    key: "averageCustomerValue",
    labelKey: "analytics.customers.kpi.averageCustomerValue",
    hintKey: "analytics.customers.kpi.hints.averageCustomerValue",
    valueFormat: "money",
    icon: <CreditCardIcon />,
    dataQa: "analytics-customers-kpi-average-customer-value",
  },
  {
    key: "ordersPerClient",
    labelKey: "analytics.customers.kpi.ordersPerClient",
    hintKey: "analytics.customers.kpi.hints.ordersPerClient",
    valueFormat: "number",
    icon: <CubeIcon />,
    dataQa: "analytics-customers-kpi-orders-per-client",
  },
  {
    key: "timeToRepurchaseDays",
    labelKey: "analytics.customers.kpi.timeToRepurchaseDays",
    hintKey: "analytics.customers.kpi.hints.timeToRepurchaseDays",
    valueFormat: "days",
    icon: <ClockIcon />,
    dataQa: "analytics-customers-kpi-time-to-repurchase-days",
  },
];

type AnalyticsCustomersKpiCardsProps = {
  kpi: AnalyticsClientsKpi | null;
  loading?: boolean;
};

export const AnalyticsCustomersKpiCards = ({
  kpi,
  loading = false,
}: AnalyticsCustomersKpiCardsProps) => {
  const { t } = useTranslation();

  if (loading && !kpi) {
    return (
      <S.Grid>
        <AnalyticsKpiCardsSkeleton count={KPI_CARD_CONFIGS.length} />
      </S.Grid>
    );
  }

  if (!kpi) {
    return null;
  }

  return (
    <S.Grid>
      {KPI_CARD_CONFIGS.map((config) => {
        const metric = kpi[config.key];

        return (
          <AnalyticsKpiCard
            key={config.key}
            metric={metric}
            label={t(config.labelKey)}
            icon={config.icon}
            valueFormat={config.valueFormat}
            dataQa={config.dataQa}
            hint={t(config.hintKey)}
            scopeLabel={getAnalyticsKpiScopeLabel(
              metric.scope,
              t("analytics.customers.kpi.scopes.allTime"),
            )}
            formatDays={(value) =>
              t("analytics.customers.kpi.daysValue", { value })
            }
          />
        );
      })}
    </S.Grid>
  );
};
