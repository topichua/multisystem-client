import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAnalyticsStore } from "@/features/analytics/model/use-analytics-store";

import { AnalyticsContentLayout } from "../components/analytics-content-layout";
import { AnalyticsPeriodFilter } from "../components/analytics-period-filter";
import { AnalyticsSectionLayout } from "../components/analytics-section-layout";
import { AnalyticsOverviewAdvancedSection } from "./components/analytics-overview-advanced-section";
import { AnalyticsOverviewBusinessHighlightsSection } from "./components/analytics-overview-business-highlights-section";
import { AnalyticsOverviewKpiCards } from "./components/analytics-overview-kpi-cards";
import * as S from "./analytics-overview-page.styled";
import { AnalyticsOverviewRevenueChart } from "./components/analytics-overview-revenue-chart";
import { AnalyticsOverviewSalesStatusSection } from "./components/analytics-overview-sales-status-section";
import { formatAnalyticsPeriodLabel } from "./utils/format-analytics-period-label";

export const AnalyticsOverviewPage = observer(() => {
  const { t } = useTranslation();
  const store = useAnalyticsStore();

  const periodLabel = useMemo(
    () =>
      formatAnalyticsPeriodLabel(
        {
          dateFilterMode: store.dateFilterMode,
          period: store.period,
          dateFrom: store.dateFrom,
          dateTo: store.dateTo,
        },
        t,
      ),
    [store.dateFilterMode, store.period, store.dateFrom, store.dateTo, t],
  );

  useEffect(() => {
    void store.loadOverview();
  }, [store]);

  return (
    <AnalyticsSectionLayout
      titleKey="analytics.menu.overview"
      descriptionKey="analytics.descriptions.overview"
    >
      <AnalyticsContentLayout toolbar={<AnalyticsPeriodFilter />}>
        <S.ReportsStack>
          <AnalyticsOverviewKpiCards
            kpi={store.kpi}
            loading={store.kpiLoading}
          />
          <AnalyticsOverviewRevenueChart
            chart={store.revenueChart}
            periodLabel={periodLabel}
            loading={store.revenueChartLoading}
          />
          <AnalyticsOverviewSalesStatusSection
            salesChannels={store.salesChannels}
            ordersByStatus={store.ordersByStatus}
            salesChannelsLoading={store.salesChannelsLoading}
            ordersByStatusLoading={store.ordersByStatusLoading}
          />
          <AnalyticsOverviewBusinessHighlightsSection
            topProducts={store.topProducts}
            topCustomers={store.topCustomers}
            topProductsLoading={store.topProductsLoading}
            topCustomersLoading={store.topCustomersLoading}
          />
          <AnalyticsOverviewAdvancedSection />
        </S.ReportsStack>
      </AnalyticsContentLayout>
    </AnalyticsSectionLayout>
  );
});
