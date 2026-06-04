import type { Characteristic } from "@/features/characteristics/model/characteristic.types";

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  ё: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "i",
  і: "i",
  ї: "yi",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "iu",
  я: "ia",
};

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
  const transliteratedLabel = label
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");
  const normalizedKey =
    transliteratedLabel
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "characteristic";
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
