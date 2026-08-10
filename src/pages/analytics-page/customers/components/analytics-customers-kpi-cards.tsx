import { InfoCircleOutlined } from "@ant-design/icons";
import {
  CaretDownIcon,
  CaretUpIcon,
  ClockIcon,
  CreditCardIcon,
  CubeIcon,
  HeartIcon,
  UserPlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Skeleton, Tooltip } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type {
  AnalyticsClientsKpi,
  AnalyticsKpiMetric,
} from "@/features/analytics/model/analytics.types";
import { formatMoney } from "@/features/orders/utils/format-money";

import * as S from "./analytics-customers-kpi-cards.styled";

type AnalyticsCustomersKpiValueFormat = "number" | "percent" | "money" | "days";

type AnalyticsCustomersKpiChangeTone = "positive" | "negative" | "neutral";

type AnalyticsCustomersKpiCardConfig = {
  key: keyof AnalyticsClientsKpi;
  labelKey: string;
  hintKey: string;
  valueFormat: AnalyticsCustomersKpiValueFormat;
  icon: ReactNode;
  dataQa: string;
};

const KPI_CARD_CONFIGS: readonly AnalyticsCustomersKpiCardConfig[] = [
  {
    key: "activeClients",
    labelKey: "analytics.customers.kpi.activeClients",
    hintKey: "analytics.customers.kpi.hints.activeClients",
    valueFormat: "number",
    icon: <UsersThreeIcon weight="duotone" />,
    dataQa: "analytics-customers-kpi-active-clients",
  },
  {
    key: "newClients",
    labelKey: "analytics.customers.kpi.newClients",
    hintKey: "analytics.customers.kpi.hints.newClients",
    valueFormat: "number",
    icon: <UserPlusIcon weight="duotone" />,
    dataQa: "analytics-customers-kpi-new-clients",
  },
  {
    key: "repeatPurchaseRate",
    labelKey: "analytics.customers.kpi.repeatPurchaseRate",
    hintKey: "analytics.customers.kpi.hints.repeatPurchaseRate",
    valueFormat: "percent",
    icon: <HeartIcon weight="duotone" />,
    dataQa: "analytics-customers-kpi-repeat-purchase-rate",
  },
  {
    key: "averageCustomerValue",
    labelKey: "analytics.customers.kpi.averageCustomerValue",
    hintKey: "analytics.customers.kpi.hints.averageCustomerValue",
    valueFormat: "money",
    icon: <CreditCardIcon weight="duotone" />,
    dataQa: "analytics-customers-kpi-average-customer-value",
  },
  {
    key: "ordersPerClient",
    labelKey: "analytics.customers.kpi.ordersPerClient",
    hintKey: "analytics.customers.kpi.hints.ordersPerClient",
    valueFormat: "number",
    icon: <CubeIcon weight="duotone" />,
    dataQa: "analytics-customers-kpi-orders-per-client",
  },
  {
    key: "timeToRepurchaseDays",
    labelKey: "analytics.customers.kpi.timeToRepurchaseDays",
    hintKey: "analytics.customers.kpi.hints.timeToRepurchaseDays",
    valueFormat: "days",
    icon: <ClockIcon weight="duotone" />,
    dataQa: "analytics-customers-kpi-time-to-repurchase-days",
  },
];

type AnalyticsCustomersKpiCardsProps = {
  kpi: AnalyticsClientsKpi | null;
  loading?: boolean;
};

function formatNumber(value: number): string {
  return value.toLocaleString("uk-UA", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("uk-UA", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatChangePercent(value: number): string {
  return `${Math.abs(value).toLocaleString("uk-UA", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function getChangeTone(
  value: AnalyticsKpiMetric["changePercent"],
): AnalyticsCustomersKpiChangeTone {
  if (value == null) {
    return "neutral";
  }

  return value >= 0 ? "positive" : "negative";
}

function isAllTimeScope(scope: string): boolean {
  return scope === "all_time" || scope === "allTime" || scope === "lifetime";
}

function getScopeLabel(
  scope: string | undefined,
  allTimeLabel: string,
): string | null {
  if (!scope || scope === "period") {
    return null;
  }

  return isAllTimeScope(scope) ? allTimeLabel : scope;
}

function formatMetricValue(
  metric: AnalyticsKpiMetric,
  format: AnalyticsCustomersKpiValueFormat,
  daysFormatter: (value: string) => string,
): string {
  switch (format) {
    case "money":
      return formatMoney(metric.value, metric.currency ?? "UAH");
    case "percent":
      return formatPercent(metric.value);
    case "days":
      return daysFormatter(formatNumber(metric.value));
    default:
      return formatNumber(metric.value);
  }
}

export const AnalyticsCustomersKpiCards = ({
  kpi,
  loading = false,
}: AnalyticsCustomersKpiCardsProps) => {
  const { t } = useTranslation();

  if (loading && !kpi) {
    return (
      <S.Grid>
        {Array.from({ length: KPI_CARD_CONFIGS.length }, (_, index) => (
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
      {KPI_CARD_CONFIGS.map((config) => {
        const metric = kpi[config.key];
        const changeTone = getChangeTone(metric.changePercent);
        const scopeLabel = getScopeLabel(
          metric.scope,
          t("analytics.customers.kpi.scopes.allTime"),
        );

        return (
          <S.Card key={config.key} data-qa={config.dataQa}>
            <S.CardTop>
              <S.IconTile aria-hidden="true">{config.icon}</S.IconTile>
              <S.ChangeBadge $tone={changeTone}>
                {metric.changePercent == null ? (
                  t("analytics.customers.kpi.changeUnavailable")
                ) : (
                  <>
                    {changeTone === "positive" ? (
                      <CaretUpIcon weight="bold" />
                    ) : (
                      <CaretDownIcon weight="bold" />
                    )}
                    {formatChangePercent(metric.changePercent)}
                  </>
                )}
              </S.ChangeBadge>
            </S.CardTop>
            <S.Value>
              {formatMetricValue(metric, config.valueFormat, (value) =>
                t("analytics.customers.kpi.daysValue", { value }),
              )}
            </S.Value>
            <S.LabelRow>
              <S.Label>{t(config.labelKey)}</S.Label>
              <Tooltip title={t(config.hintKey)}>
                <S.InfoIcon aria-label={t(config.hintKey)}>
                  <InfoCircleOutlined />
                </S.InfoIcon>
              </Tooltip>
            </S.LabelRow>
            {scopeLabel && <S.ScopeBadge>{scopeLabel}</S.ScopeBadge>}
          </S.Card>
        );
      })}
    </S.Grid>
  );
};
