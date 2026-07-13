import { DatePicker, Segmented } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  ANALYTICS_PERIOD_PRESETS,
  type AnalyticsPeriodPreset,
} from "@/features/analytics/model/analytics-period.constants";
import { useAnalyticsStore } from "@/features/analytics/model/use-analytics-store";
import { formatApiDate } from "@/utils/date-time";

import * as S from "./analytics-period-filter.styled";

const { RangePicker } = DatePicker;

export const AnalyticsPeriodFilter = observer(() => {
  const { t } = useTranslation();
  const store = useAnalyticsStore();

  const presetOptions = useMemo(
    () =>
      ANALYTICS_PERIOD_PRESETS.map((preset) => ({
        label: t(`analytics.periodFilter.presets.${preset}`),
        value: preset,
      })),
    [t],
  );

  const rangeValue = useMemo((): [Dayjs, Dayjs] | null => {
    if (store.dateFilterMode !== "custom" || !store.dateFrom || !store.dateTo) {
      return null;
    }

    return [dayjs(store.dateFrom), dayjs(store.dateTo)];
  }, [store.dateFilterMode, store.dateFrom, store.dateTo]);

  return (
    <S.Root>
      <S.Presets>
        <Segmented
          value={store.dateFilterMode === "preset" ? store.period : undefined}
          options={presetOptions}
          onChange={(value) => {
            if (typeof value === "string") {
              void store.applyPeriodPreset(value as AnalyticsPeriodPreset);
            }
          }}
        />
      </S.Presets>
      <S.RangeField>
        <RangePicker
          allowClear
          inputReadOnly
          format="YYYY/MM/DD"
          placeholder={[
            t("analytics.periodFilter.rangeFrom"),
            t("analytics.periodFilter.rangeTo"),
          ]}
          value={rangeValue}
          onChange={(dates) => {
            if (dates?.[0] && dates[1]) {
              void store.applyCustomDateRange(
                formatApiDate(dates[0]),
                formatApiDate(dates[1]),
              );
              return;
            }

            void store.applyPeriodPreset(store.period);
          }}
        />
      </S.RangeField>
    </S.Root>
  );
});
