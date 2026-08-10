import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAnalyticsStore } from "@/features/analytics/model/use-analytics-store";

import { AnalyticsContentLayout } from "../components/analytics-content-layout";
import { AnalyticsPeriodFilter } from "../components/analytics-period-filter";
import { AnalyticsProBadge } from "../components/analytics-pro-badge.styled";
import { AnalyticsReportsStack } from "../components/analytics-reports-stack";
import { AnalyticsSectionLayout } from "../components/analytics-section-layout";
import { AnalyticsCustomersKpiCards } from "./components/analytics-customers-kpi-cards";
import { AnalyticsCustomersNewVsRepeatCard } from "./components/analytics-customers-new-vs-repeat-card";
import { AnalyticsCustomersReturningSection } from "./components/analytics-customers-returning-section";
import { AnalyticsCustomersTopValuableTable } from "./components/analytics-customers-top-valuable-table";
import { AnalyticsCustomersAcquisitionSources } from "./components/analytics-customers-acquisition-sources";

export const AnalyticsCustomersPage = observer(() => {
  const { t } = useTranslation();
  const store = useAnalyticsStore();

  useEffect(() => {
    void store.loadClientsAnalytics();
  }, [store]);

  return (
    <AnalyticsSectionLayout
      titleKey="analytics.menu.customers"
      descriptionKey="analytics.descriptions.customers"
      titleExtra={
        <AnalyticsProBadge>{t("analytics.menu.proBadge")}</AnalyticsProBadge>
      }
    >
      <AnalyticsContentLayout
        toolbar={
          <AnalyticsPeriodFilter onFiltersChange={store.loadClientsAnalytics} />
        }
      >
        <AnalyticsReportsStack dataQa="layout-analytics-customers-reports">
          <AnalyticsCustomersKpiCards
            kpi={store.clientsKpi}
            loading={store.clientsKpiLoading}
          />
          <AnalyticsCustomersNewVsRepeatCard
            data={store.clientsNewVsRepeat}
            loading={store.clientsNewVsRepeatLoading}
          />
          <AnalyticsCustomersReturningSection
            repeatFunnel={store.clientsRepeatFunnel}
            returnTiming={store.clientsReturnTiming}
            winBack={store.clientsWinBack}
            repeatFunnelLoading={store.clientsRepeatFunnelLoading}
            returnTimingLoading={store.clientsReturnTimingLoading}
            winBackLoading={store.clientsWinBackLoading}
          />
          <AnalyticsCustomersTopValuableTable
            data={store.clientsTopValuable}
            loading={store.clientsTopValuableLoading}
            sort={store.clientsTopValuableSort}
            onSortChange={store.applyClientsTopValuableSort}
          />
          <AnalyticsCustomersAcquisitionSources
            data={store.clientsAcquisitionSources}
            loading={store.clientsAcquisitionSourcesLoading}
          />
        </AnalyticsReportsStack>
      </AnalyticsContentLayout>
    </AnalyticsSectionLayout>
  );
});
