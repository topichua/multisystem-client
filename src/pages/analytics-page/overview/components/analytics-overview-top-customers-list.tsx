import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { AnalyticsTopCustomers } from "@/features/analytics/model/analytics.types";
import { formatMoney } from "@/features/orders/utils/format-money";

import {
  getCustomerAvatarColor,
  getPersonInitials,
  getRankedListPercent,
} from "../utils/analytics-ranked-list.utils";

import { AnalyticsOverviewReportCard } from "./analytics-overview-report-card";
import * as S from "./analytics-overview-ranked-list.styled";

type AnalyticsOverviewTopCustomersListProps = {
  data: AnalyticsTopCustomers | null;
  loading?: boolean;
};

export const AnalyticsOverviewTopCustomersList = ({
  data,
  loading = false,
}: AnalyticsOverviewTopCustomersListProps) => {
  const { t } = useTranslation();

  const maxSpent = useMemo(
    () =>
      Math.max(
        ...(data?.customers.map((customer) => customer.spent) ?? [0]),
        0,
      ),
    [data?.customers],
  );

  const isEmpty = !data || data.customers.length === 0;

  return (
    <AnalyticsOverviewReportCard
      title={t("analytics.overview.topCustomers.title")}
      subtitle={t("analytics.overview.topCustomers.subtitle")}
      dataQa="analytics-overview-top-customers-list"
      loading={loading && isEmpty}
      isEmpty={!loading && isEmpty}
      contentVariant="list"
    >
      {data?.customers.map((customer) => (
        <S.Row key={customer.clientId}>
          <S.Media>
            {customer.avatar ? (
              <S.CustomerAvatarImageOnly
                src={customer.avatar}
                alt={customer.name}
              />
            ) : (
              <S.CustomerAvatar $color={getCustomerAvatarColor(customer.name)}>
                {getPersonInitials(customer.name)}
              </S.CustomerAvatar>
            )}
          </S.Media>

          <S.Content>
            <S.TopLine>
              <S.Name title={customer.name}>{customer.name}</S.Name>
              <S.Value>{formatMoney(customer.spent, "UAH")}</S.Value>
            </S.TopLine>

            <S.BottomLine>
              <S.ProgressTrack>
                <S.ProgressFill
                  $width={getRankedListPercent(customer.spent, maxSpent)}
                />
              </S.ProgressTrack>
              <S.Meta>
                {t("analytics.overview.topCustomers.orders", {
                  count: customer.orders,
                })}
              </S.Meta>
            </S.BottomLine>
          </S.Content>
        </S.Row>
      ))}
    </AnalyticsOverviewReportCard>
  );
};
