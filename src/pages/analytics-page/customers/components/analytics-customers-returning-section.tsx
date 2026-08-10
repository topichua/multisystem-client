import { Progress } from "antd";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { pagesMap } from "@/app/router/pages-map";
import type {
  AnalyticsClientsRepeatFunnel,
  AnalyticsClientsRepeatFunnelStep,
  AnalyticsClientsReturnTiming,
  AnalyticsClientsReturnTimingBucket,
  AnalyticsClientsWinBack,
  AnalyticsClientsWinBackBucket,
} from "@/features/analytics/model/analytics.types";
import { AnalyticsOverviewReportCard } from "@/pages/analytics-page/overview/components/analytics-overview-report-card";

import * as S from "./analytics-customers-returning-section.styled";

type AnalyticsCustomersReturningSectionProps = {
  repeatFunnel: AnalyticsClientsRepeatFunnel | null;
  returnTiming: AnalyticsClientsReturnTiming | null;
  winBack: AnalyticsClientsWinBack | null;
  repeatFunnelLoading?: boolean;
  returnTimingLoading?: boolean;
  winBackLoading?: boolean;
};

const WIN_BACK_BUCKET_COLORS: Record<string, string> = {
  d25_45: "#E4A20C",
  d46_90: "#E96B3D",
  d90_plus: "#E1524D",
};

function formatNumber(value: number): string {
  return value.toLocaleString("uk-UA");
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("uk-UA", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  })}%`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(value, 100));
}

function getRepeatStepLabel(
  step: AnalyticsClientsRepeatFunnelStep,
  t: TFunction,
): string {
  return t(`analytics.customers.repeatFunnel.steps.${step.key}`, {
    count: step.minOrders,
    defaultValue: t("analytics.customers.repeatFunnel.steps.fallback", {
      count: step.minOrders,
    }),
  });
}

function getReturnTimingBucketLabel(
  bucket: AnalyticsClientsReturnTimingBucket,
  t: TFunction,
): string {
  return t(`analytics.customers.returnTiming.buckets.${bucket.key}`, {
    defaultValue: t("analytics.customers.returnTiming.buckets.fallback", {
      key: bucket.key,
    }),
  });
}

function getWinBackBucketLabel(
  bucket: AnalyticsClientsWinBackBucket,
  t: TFunction,
): string {
  return t(`analytics.customers.winBack.buckets.${bucket.key}`, {
    defaultValue: t("analytics.customers.winBack.buckets.fallback", {
      key: bucket.key,
    }),
  });
}

export const AnalyticsCustomersReturningSection = ({
  repeatFunnel,
  returnTiming,
  winBack,
  repeatFunnelLoading = false,
  returnTimingLoading = false,
  winBackLoading = false,
}: AnalyticsCustomersReturningSectionProps) => {
  const { t } = useTranslation();
  const repeatSteps = repeatFunnel?.steps ?? [];
  const timingBuckets = returnTiming?.buckets ?? [];
  const winBackBuckets = winBack?.buckets ?? [];

  return (
    <S.Section>
      <S.SectionTitle>
        {t("analytics.customers.returning.sectionTitle")}
      </S.SectionTitle>
      <S.TwoColumnGrid>
        <AnalyticsOverviewReportCard
          title={t("analytics.customers.repeatFunnel.title")}
          subtitle={t("analytics.customers.repeatFunnel.subtitle")}
          dataQa="analytics-customers-repeat-funnel"
          contentVariant="list"
          loading={repeatFunnelLoading}
          isEmpty={!repeatFunnelLoading && repeatSteps.length === 0}
        >
          <S.FunnelList>
            {repeatSteps.map((step) => (
              <S.FunnelRow key={step.key}>
                <S.FunnelMeta>
                  <S.FunnelLabel>{getRepeatStepLabel(step, t)}</S.FunnelLabel>
                  <S.FunnelValues>
                    <S.FunnelClients>
                      {formatNumber(step.clients)}
                    </S.FunnelClients>
                    <S.FunnelPercent>
                      {formatPercent(step.percent)}
                    </S.FunnelPercent>
                  </S.FunnelValues>
                </S.FunnelMeta>
                <S.ProgressWrap>
                  <Progress
                    percent={clampPercent(step.percent)}
                    showInfo={false}
                    size="small"
                    strokeColor="#6E62CD"
                    trailColor="#EEF0F4"
                  />
                </S.ProgressWrap>
              </S.FunnelRow>
            ))}
          </S.FunnelList>
        </AnalyticsOverviewReportCard>

        <AnalyticsOverviewReportCard
          title={t("analytics.customers.returnTiming.title")}
          subtitle={t("analytics.customers.returnTiming.subtitle")}
          dataQa="analytics-customers-return-timing"
          contentVariant="list"
          loading={returnTimingLoading}
          isEmpty={!returnTimingLoading && timingBuckets.length === 0}
        >
          <S.TimingChart>
            {timingBuckets.map((bucket) => {
              const percent = clampPercent(bucket.percent);

              return (
                <S.TimingColumn key={bucket.key}>
                  <S.TimingValue>{formatPercent(bucket.percent)}</S.TimingValue>
                  <S.TimingBarSlot>
                    <S.TimingBar
                      $height={percent}
                      $isEmpty={bucket.percent <= 0}
                    />
                  </S.TimingBarSlot>
                  <S.TimingLabel>
                    {getReturnTimingBucketLabel(bucket, t)}
                  </S.TimingLabel>
                </S.TimingColumn>
              );
            })}
          </S.TimingChart>
        </AnalyticsOverviewReportCard>
      </S.TwoColumnGrid>

      <AnalyticsOverviewReportCard
        title={t("analytics.customers.winBack.title")}
        subtitle={t("analytics.customers.winBack.subtitle")}
        dataQa="analytics-customers-win-back"
        contentVariant="list"
        loading={winBackLoading}
        isEmpty={!winBackLoading && winBackBuckets.length === 0}
      >
        <S.WinBackBucketsGrid>
          {winBackBuckets.map((bucket) => (
            <S.WinBackBucketCard key={bucket.key}>
              <S.WinBackBucketLabelRow>
                <S.WinBackDot
                  $color={WIN_BACK_BUCKET_COLORS[bucket.key] ?? "#8B93B4"}
                />
                <S.WinBackBucketLabel>
                  {getWinBackBucketLabel(bucket, t)}
                </S.WinBackBucketLabel>
              </S.WinBackBucketLabelRow>
              <S.WinBackBucketValue>
                {formatNumber(bucket.clients)}
              </S.WinBackBucketValue>
            </S.WinBackBucketCard>
          ))}
        </S.WinBackBucketsGrid>
        <S.WinBackFooter>
          <S.WinBackSummary>
            <S.WinBackSummaryValue>
              {formatNumber(winBack?.totalClients ?? 0)}
            </S.WinBackSummaryValue>
            <S.WinBackSummaryText>
              {t("analytics.customers.winBack.summaryLabel")}
            </S.WinBackSummaryText>
          </S.WinBackSummary>
          <S.WinBackLink to={pagesMap.clients}>
            {t("analytics.customers.winBack.clientsLink")}
          </S.WinBackLink>
        </S.WinBackFooter>
      </AnalyticsOverviewReportCard>
    </S.Section>
  );
};
