import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { AnalyticsCharts } from "@/pages/analytics-page/components/analytics-charts";
import { analyticsSummary } from "@/pages/analytics-page/mock/analytics-mock-data";

import * as S from "./analytics-page.styled";

const { Title } = Typography;

const formatSummaryCurrency = (value: number): string =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(value);

export const AnalyticsPage = () => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header>
        <Title level={4} style={{ marginTop: 0 }}>
          {t("analytics.pageTitle")}
        </Title>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body>
        <S.SummaryRow>
          <S.SummaryCard>
            <S.SummaryLabel>{t("analytics.summary.revenue")}</S.SummaryLabel>
            <S.SummaryValue>
              {formatSummaryCurrency(analyticsSummary.totalRevenue)}
            </S.SummaryValue>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.SummaryLabel>{t("analytics.summary.orders")}</S.SummaryLabel>
            <S.SummaryValue>{analyticsSummary.totalOrders}</S.SummaryValue>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.SummaryLabel>{t("analytics.summary.products")}</S.SummaryLabel>
            <S.SummaryValue>{analyticsSummary.activeProducts}</S.SummaryValue>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.SummaryLabel>{t("analytics.summary.conversion")}</S.SummaryLabel>
            <S.SummaryValue>{analyticsSummary.conversionRate}%</S.SummaryValue>
          </S.SummaryCard>
        </S.SummaryRow>
        <S.ChartsGrid>
          <AnalyticsCharts />
        </S.ChartsGrid>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
