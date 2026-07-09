import { useTranslation } from "react-i18next";

import type {
  AnalyticsTopCustomers,
  AnalyticsTopProducts,
} from "@/features/analytics/model/analytics.types";

import * as S from "./analytics-overview-report-card.styled";
import { AnalyticsOverviewTopCustomersList } from "./analytics-overview-top-customers-list";
import { AnalyticsOverviewTopProductsList } from "./analytics-overview-top-products-list";

type AnalyticsOverviewBusinessHighlightsSectionProps = {
  topProducts: AnalyticsTopProducts | null;
  topCustomers: AnalyticsTopCustomers | null;
  topProductsLoading?: boolean;
  topCustomersLoading?: boolean;
};

export const AnalyticsOverviewBusinessHighlightsSection = ({
  topProducts,
  topCustomers,
  topProductsLoading = false,
  topCustomersLoading = false,
}: AnalyticsOverviewBusinessHighlightsSectionProps) => {
  const { t } = useTranslation();

  return (
    <S.Section>
      <S.SectionTitle>
        {t("analytics.overview.businessHighlights.sectionTitle")}
      </S.SectionTitle>
      <S.TwoColumnGrid>
        <AnalyticsOverviewTopProductsList
          data={topProducts}
          loading={topProductsLoading}
        />
        <AnalyticsOverviewTopCustomersList
          data={topCustomers}
          loading={topCustomersLoading}
        />
      </S.TwoColumnGrid>
    </S.Section>
  );
};
