import type { Characteristic } from "@/features/characteristics/model/characteristic.types";
import { slugifyAscii } from "@/utils/slugify";

export function sortCharacteristicsByOrder(
  characteristics: Characteristic[],
): Characteristic[] {
  return [...characteristics].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.label.localeCompare(right.label);
  });
}

export function getNextCharacteristicSortOrder(
  characteristics: Characteristic[],
): number {
  if (characteristics.length === 0) {
    return 0;
  }

  return Math.max(...characteristics.map((item) => item.sortOrder)) + 1;
}

export function buildUniqueCharacteristicKey(
  label: string,
  characteristics: Characteristic[],
): string {
  const normalizedKey = slugifyAscii(label, {
    fallback: "characteristic",
    separator: "_",
  });
  const baseKey = /^[a-z]/.test(normalizedKey)
    ? normalizedKey
    : `characteristic_${normalizedKey}`;

  const existingKeys = new Set(characteristics.map((item) => item.key));
  let nextKey = baseKey;
  let index = 2;

  while (existingKeys.has(nextKey)) {
    nextKey = `${baseKey}_${index}`;
    index += 1;
  }

  return nextKey;
}

export function normalizeCharacteristicOptionValue(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function hasDuplicateCharacteristicOptionValue(
  values: string[],
  value: string,
  excludeIndex?: number,
): boolean {
  const normalizedValue = normalizeCharacteristicOptionValue(value);

  return values.some(
    (item, index) =>
      index !== excludeIndex &&
      normalizeCharacteristicOptionValue(item) === normalizedValue,
  );
}

export function resolveNextCharacteristicIdAfterDelete(
  characteristics: Characteristic[],
  deletedId: number,
): number | null {
  const sorted = sortCharacteristicsByOrder(characteristics);
  const currentIndex = sorted.findIndex((item) => item.id === deletedId);

  if (currentIndex === -1) {
    return sorted[0]?.id ?? null;
  }

  return sorted[currentIndex + 1]?.id ?? sorted[currentIndex - 1]?.id ?? null;
}
