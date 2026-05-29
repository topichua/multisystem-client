import { getColorHex } from "../../shared/color-registry";

export function isColorLikeCharacteristicField(field: {
  key: string;
  label: string;
}): boolean {
  const normalized = `${field.key} ${field.label}`.toLowerCase();

  return (
    normalized.includes("color") ||
    normalized.includes("colour") ||
    normalized.includes("колір") ||
    normalized.includes("цвет")
  );
}

/** Returns a hex swatch color, or null when the value is empty. */
export function resolveCharacteristicDisplayColor(
  value: string,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return getColorHex(trimmed);
}
