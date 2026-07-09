import dayjs from "dayjs";
import type { TFunction } from "i18next";

import type {
  AnalyticsDateFilterMode,
  AnalyticsPeriodPreset,
} from "@/features/analytics/model/analytics-period.constants";

type FormatAnalyticsPeriodLabelParams = {
  dateFilterMode: AnalyticsDateFilterMode;
  period: AnalyticsPeriodPreset;
  dateFrom: string | null;
  dateTo: string | null;
};

export function formatAnalyticsPeriodLabel(
  params: FormatAnalyticsPeriodLabelParams,
  t: TFunction,
): string {
  if (params.dateFilterMode === "custom" && params.dateFrom && params.dateTo) {
    return t("analytics.periodFilter.customRangeLabel", {
      from: dayjs(params.dateFrom).format("DD.MM.YYYY"),
      to: dayjs(params.dateTo).format("DD.MM.YYYY"),
    });
  }

  return t("analytics.periodFilter.presetLabel", {
    period: t(`analytics.periodFilter.presets.${params.period}`),
  });
}
