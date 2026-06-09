import { useMemo } from "react";
import { useTheme } from "styled-components";

import { CHART_PALETTE } from "@/pages/analytics-page/mock/analytics-mock-data";
import { useThemeMode } from "@/theme/use-theme-mode";

export type AnalyticsChartTheme = {
  colors: readonly string[];
  textColor: string;
  headingColor: string;
  splitLineColor: string;
  axisLineColor: string;
  tooltipBackground: string;
  tooltipBorder: string;
  isDark: boolean;
};

export const useAnalyticsChartTheme = (): AnalyticsChartTheme => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  return useMemo(
    () => ({
      colors: CHART_PALETTE,
      textColor: theme.colors.functional.text.subdued,
      headingColor: theme.colors.functional.text.heading,
      splitLineColor: theme.colors.functional.border.split,
      axisLineColor: theme.colors.functional.border.cardBase,
      tooltipBackground: theme.colors.functional.background.elevated,
      tooltipBorder: theme.colors.functional.border.cardBase,
      isDark,
    }),
    [isDark, theme],
  );
};
