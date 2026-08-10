import { useTranslation } from "react-i18next";

import type {
  AnalyticsClientsAcquisitionSource,
  AnalyticsClientsAcquisitionSources,
} from "@/features/analytics/model/analytics.types";
import { AnalyticsOverviewReportCard } from "@/pages/analytics-page/overview/components/analytics-overview-report-card";

import * as S from "./analytics-customers-acquisition-sources.styled";

const SOURCE_BRAND_COLORS: Record<string, string> = {
  instagram: "#D93273",
  telegram: "#2D9CDB",
  tiktok: "#8B93A3",
  manual: "#B18160",
  website: "#6E62CD",
  facebook: "#1877F2",
  messenger: "#0084FF",
  viber: "#7360F2",
  whatsapp: "#25D366",
};

const FALLBACK_SOURCE_COLORS = [
  "#6E62CD",
  "#2D9CDB",
  "#D93273",
  "#17A398",
  "#E4A20C",
  "#E96B3D",
  "#5B8DEF",
  "#8B5CF6",
  "#2F9E44",
  "#D9480F",
  "#0B7285",
  "#C2255C",
] as const;

type AnalyticsCustomersAcquisitionSourcesProps = {
  data: AnalyticsClientsAcquisitionSources | null;
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

function clampPercent(value: number): number {
  return Math.max(0, Math.min(value, 100));
}

function normalizeSourceKey(value: string): string {
  return value.trim().toLowerCase();
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getSourceColor(source: string): string {
  const key = normalizeSourceKey(source);
  const brandColor = SOURCE_BRAND_COLORS[key];

  if (brandColor) {
    return brandColor;
  }

  return (
    FALLBACK_SOURCE_COLORS[hashString(key) % FALLBACK_SOURCE_COLORS.length] ??
    FALLBACK_SOURCE_COLORS[0]
  );
}

function getSourceLabel(source: AnalyticsClientsAcquisitionSource): string {
  return source.name.trim() || source.source.trim() || "—";
}

export const AnalyticsCustomersAcquisitionSources = ({
  data,
  loading = false,
}: AnalyticsCustomersAcquisitionSourcesProps) => {
  const { t } = useTranslation();
  const sources = data?.sources ?? [];

  return (
    <S.Section>
      <S.SectionTitle>
        {t("analytics.customers.acquisition.sectionTitle")}
      </S.SectionTitle>
      <AnalyticsOverviewReportCard
        title={t("analytics.customers.acquisition.title")}
        subtitle={t("analytics.customers.acquisition.subtitle")}
        dataQa="analytics-customers-acquisition-sources"
        contentVariant="list"
        loading={loading}
        isEmpty={!loading && sources.length === 0}
      >
        <S.SourceList>
          {sources.map((source, index) => {
            const sourceKey = source.source || source.name;
            const color = getSourceColor(sourceKey);

            return (
              <S.SourceRow key={`${sourceKey}-${index}`}>
                <S.SourceNameCell>
                  <S.SourceDot $color={color} />
                  <S.SourceName>{getSourceLabel(source)}</S.SourceName>
                </S.SourceNameCell>
                <S.SourceBarTrack>
                  <S.SourceBarFill
                    $color={color}
                    $width={clampPercent(source.percent)}
                  />
                </S.SourceBarTrack>
                <S.SourceClients>
                  {formatNumber(source.clients)}
                </S.SourceClients>
                <S.SourcePercent>
                  {formatPercent(source.percent)}
                </S.SourcePercent>
              </S.SourceRow>
            );
          })}
        </S.SourceList>
      </AnalyticsOverviewReportCard>
    </S.Section>
  );
};
