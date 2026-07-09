import { BRAND_PRIMARY } from "@/styled/brand";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function resolveAnalyticsStatusColor(
  color: string | null | undefined,
  fallback: string = BRAND_PRIMARY,
): string {
  const normalized = color?.trim();

  if (normalized && HEX_COLOR_PATTERN.test(normalized)) {
    return normalized;
  }

  return fallback;
}
