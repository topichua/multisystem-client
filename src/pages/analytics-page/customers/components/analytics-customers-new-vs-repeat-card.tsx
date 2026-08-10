import { useTranslation } from "react-i18next";

import type {
  AnalyticsClientsNewVsRepeat,
  AnalyticsClientsNewVsRepeatSegment,
} from "@/features/analytics/model/analytics.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { AnalyticsOverviewReportCard } from "@/pages/analytics-page/overview/components/analytics-overview-report-card";

import * as S from "./analytics-customers-new-vs-repeat-card.styled";

const SEGMENT_COLORS: Record<string, string> = {
  new: "#6E62CD",
  repeat: "#B9B8EA",
};

const SEGMENT_LABEL_TONES: Record<string, "light" | "dark"> = {
  new: "light",
  repeat: "dark",
};

type AnalyticsCustomersNewVsRepeatCardProps = {
  data: AnalyticsClientsNewVsRepeat | null;
  loading?: boolean;
};

function formatNumber(value: number): string {
  return value.toLocaleString("uk-UA");
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("uk-UA", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  })}%`;
}

function segmentPercentWidth(segment: AnalyticsClientsNewVsRepeatSegment) {
  return Math.max(0, Math.min(segment.revenuePercent, 100));
}

export const AnalyticsCustomersNewVsRepeatCard = ({
  data,
  loading = false,
}: AnalyticsCustomersNewVsRepeatCardProps) => {
  const { t } = useTranslation();
  const segments = data?.segments ?? [];

  return (
    <S.Section>
      <S.SectionTitle>
        {t("analytics.customers.salesStructure.sectionTitle")}
      </S.SectionTitle>
      <AnalyticsOverviewReportCard
        title={t("analytics.customers.newVsRepeat.title")}
        subtitle={t("analytics.customers.newVsRepeat.subtitle")}
        dataQa="analytics-customers-new-vs-repeat"
        contentVariant="list"
        loading={loading}
        isEmpty={!loading && segments.length === 0}
      >
        <S.StackedBar>
          {segments.map((segment) => (
            <S.BarSegment
              key={segment.key}
              $color={SEGMENT_COLORS[segment.key] ?? "#8B93B4"}
              $width={segmentPercentWidth(segment)}
            >
              <S.BarLabel
                $tone={SEGMENT_LABEL_TONES[segment.key] ?? "light"}
                $hidden={segment.revenuePercent <= 0}
              >
                {formatPercent(segment.revenuePercent)}
              </S.BarLabel>
            </S.BarSegment>
          ))}
        </S.StackedBar>

        <S.SegmentGrid>
          {segments.map((segment) => (
            <S.SegmentCard key={segment.key}>
              <S.SegmentTitleRow>
                <S.LegendDot
                  $color={SEGMENT_COLORS[segment.key] ?? "#8B93B4"}
                />
                <S.SegmentTitle>
                  {t(
                    `analytics.customers.newVsRepeat.segments.${segment.key}`,
                    {
                      defaultValue: t(
                        "analytics.customers.newVsRepeat.segments.fallback",
                        { key: segment.key },
                      ),
                    },
                  )}
                </S.SegmentTitle>
              </S.SegmentTitleRow>
              <S.ClientsLine>
                {t("analytics.customers.newVsRepeat.clients", {
                  count: formatNumber(segment.clients),
                })}
              </S.ClientsLine>
              <S.RevenueLine>
                {formatMoney(segment.revenue, data?.currency ?? "UAH")}
              </S.RevenueLine>
              <S.PercentLine>
                {t("analytics.customers.newVsRepeat.revenueShare", {
                  percent: formatPercent(segment.revenuePercent),
                })}
              </S.PercentLine>
            </S.SegmentCard>
          ))}
        </S.SegmentGrid>
      </AnalyticsOverviewReportCard>
    </S.Section>
  );
};
