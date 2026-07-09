export const ANALYTICS_PERIOD_PRESETS = [
  "7d",
  "30d",
  "quarter",
  "year",
] as const;

export type AnalyticsPeriodPreset = (typeof ANALYTICS_PERIOD_PRESETS)[number];

export type AnalyticsDateFilterMode = "preset" | "custom";

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriodPreset = "30d";

export function isAnalyticsPeriodPreset(
  value: string,
): value is AnalyticsPeriodPreset {
  return (ANALYTICS_PERIOD_PRESETS as readonly string[]).includes(value);
}
