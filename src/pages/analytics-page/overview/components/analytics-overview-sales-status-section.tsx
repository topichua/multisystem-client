import { useTranslation } from "react-i18next";

import type {
  AnalyticsOrdersByStatus,
  AnalyticsSalesChannels,
} from "@/features/analytics/model/analytics.types";

import { AnalyticsOverviewOrdersByStatusChart } from "./analytics-overview-orders-by-status-chart";
import * as S from "./analytics-overview-report-card.styled";
import { AnalyticsOverviewSalesChannelsChart } from "./analytics-overview-sales-channels-chart";

type AnalyticsOverviewSalesStatusSectionProps = {
  salesChannels: AnalyticsSalesChannels | null;
  ordersByStatus: AnalyticsOrdersByStatus | null;
  salesChannelsLoading?: boolean;
  ordersByStatusLoading?: boolean;
};

export const AnalyticsOverviewSalesStatusSection = ({
  salesChannels,
  ordersByStatus,
  salesChannelsLoading = false,
  ordersByStatusLoading = false,
}: AnalyticsOverviewSalesStatusSectionProps) => {
  const { t } = useTranslation();

  return (
    <S.Section>
      <S.SectionTitle>
        {t("analytics.overview.salesStatus.sectionTitle")}
      </S.SectionTitle>
      <S.TwoColumnGrid>
        <AnalyticsOverviewSalesChannelsChart
          data={salesChannels}
          loading={salesChannelsLoading}
        />
        <AnalyticsOverviewOrdersByStatusChart
          data={ordersByStatus}
          loading={ordersByStatusLoading}
        />
      </S.TwoColumnGrid>
    </S.Section>
  );
};
