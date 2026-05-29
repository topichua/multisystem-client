export const COLOR_REGISTRY_FALLBACK_HEX = "#D1D5DB";

const COLOR_HEX_BY_NAME: Record<string, string> = {
  // black
  black: "#1F2937",
  чорний: "#1F2937",
  черный: "#1F2937",
  // white
  white: "#F9FAFB",
  білий: "#F9FAFB",
  белый: "#F9FAFB",
  // red
  red: "#EF4444",
  червоний: "#EF4444",
  красный: "#EF4444",
  // blue
  blue: "#3B82F6",
  синій: "#3B82F6",
  синий: "#3B82F6",
  // green
  green: "#22C55E",
  зелений: "#22C55E",
  зеленый: "#22C55E",
  // yellow
  yellow: "#FACC15",
  жовтий: "#FACC15",
  желтый: "#FACC15",
  // pink
  pink: "#EC4899",
  рожевий: "#EC4899",
  розовый: "#EC4899",
  // purple
  purple: "#8B5CF6",
  фіолетовий: "#8B5CF6",
  фиолетовый: "#8B5CF6",
  // gray
  gray: "#9CA3AF",
  grey: "#9CA3AF",
  сірий: "#9CA3AF",
  серый: "#9CA3AF",
  // beige
  beige: "#D6B98C",
  бежевий: "#D6B98C",
  бежевый: "#D6B98C",
};

function normalizeColorName(value: string): string {
  return value.trim().toLocaleLowerCase("uk-UA");
}

/** Resolves a human-readable color name to a design-system HEX (never a CSS keyword). */
export function getColorHex(value: string): string {
  const normalized = normalizeColorName(value);
  if (!normalized) {
    return COLOR_REGISTRY_FALLBACK_HEX;
  }

  return COLOR_HEX_BY_NAME[normalized] ?? COLOR_REGISTRY_FALLBACK_HEX;
}
