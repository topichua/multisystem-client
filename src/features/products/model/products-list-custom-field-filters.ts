export const PRODUCTS_LIST_CUSTOM_FIELD_QUERY_PREFIX = "field:";

export type ProductsListCustomFieldFilter =
  | { fieldId: number; mode: "all" }
  | { fieldId: number; mode: "options"; optionIds: number[] }
  | { fieldId: number; mode: "text"; value: string };

export function customFieldFilterQueryKey(fieldId: number): string {
  return `${PRODUCTS_LIST_CUSTOM_FIELD_QUERY_PREFIX}${fieldId}`;
}

export function parseCustomFieldFilterQueryKey(key: string): number | null {
  if (!key.startsWith(PRODUCTS_LIST_CUSTOM_FIELD_QUERY_PREFIX)) {
    return null;
  }

  const rawId = key.slice(PRODUCTS_LIST_CUSTOM_FIELD_QUERY_PREFIX.length);
  const fieldId = Number.parseInt(rawId, 10);
  if (!Number.isFinite(fieldId) || fieldId < 1 || String(fieldId) !== rawId) {
    return null;
  }

  return fieldId;
}

export function parseCustomFieldFilterValue(
  fieldId: number,
  raw: string,
): ProductsListCustomFieldFilter | null {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  if (value.toLowerCase() === "all") {
    return { fieldId, mode: "all" };
  }

  const parts = value.split(",").map((part) => part.trim());
  const optionIds = parts.map((part) => Number.parseInt(part, 10));
  const allOptionIds =
    parts.length > 0 &&
    optionIds.every(
      (id, index) =>
        Number.isFinite(id) && id >= 1 && String(id) === parts[index],
    );

  if (allOptionIds) {
    const uniqueSorted = [...new Set(optionIds)].sort((a, b) => a - b);
    if (uniqueSorted.length === 0) {
      return null;
    }
    return { fieldId, mode: "options", optionIds: uniqueSorted };
  }

  return { fieldId, mode: "text", value };
}

export function serializeCustomFieldFilterValue(
  filter: ProductsListCustomFieldFilter,
): string {
  if (filter.mode === "all") {
    return "all";
  }
  if (filter.mode === "options") {
    return [...new Set(filter.optionIds)]
      .filter((id) => Number.isFinite(id) && id >= 1)
      .sort((a, b) => a - b)
      .join(",");
  }
  return filter.value.trim();
}

export function normalizeCustomFieldFilters(
  filters: ProductsListCustomFieldFilter[],
): ProductsListCustomFieldFilter[] {
  const byFieldId = new Map<number, ProductsListCustomFieldFilter>();

  for (const filter of filters) {
    if (!Number.isFinite(filter.fieldId) || filter.fieldId < 1) {
      continue;
    }

    if (filter.mode === "options") {
      const optionIds = [...new Set(filter.optionIds)]
        .filter((id) => Number.isFinite(id) && id >= 1)
        .sort((a, b) => a - b);
      if (optionIds.length === 0) {
        continue;
      }
      byFieldId.set(filter.fieldId, {
        fieldId: filter.fieldId,
        mode: "options",
        optionIds,
      });
      continue;
    }

    if (filter.mode === "text") {
      const value = filter.value.trim();
      if (!value) {
        continue;
      }
      byFieldId.set(filter.fieldId, {
        fieldId: filter.fieldId,
        mode: "text",
        value,
      });
      continue;
    }

    byFieldId.set(filter.fieldId, { fieldId: filter.fieldId, mode: "all" });
  }

  return [...byFieldId.values()].sort((a, b) => a.fieldId - b.fieldId);
}

export function customFieldFiltersEqual(
  a: ProductsListCustomFieldFilter[],
  b: ProductsListCustomFieldFilter[],
): boolean {
  const left = normalizeCustomFieldFilters(a);
  const right = normalizeCustomFieldFilters(b);
  if (left.length !== right.length) {
    return false;
  }

  return left.every((filter, index) => {
    const other = right[index];
    if (filter.fieldId !== other.fieldId || filter.mode !== other.mode) {
      return false;
    }
    if (filter.mode === "options" && other.mode === "options") {
      return (
        filter.optionIds.length === other.optionIds.length &&
        filter.optionIds.every((id, i) => id === other.optionIds[i])
      );
    }
    if (filter.mode === "text" && other.mode === "text") {
      return filter.value === other.value;
    }
    return true;
  });
}

export function applyCustomFieldFiltersToQueryRecord(
  out: Record<string, string | number | boolean>,
  filters: ProductsListCustomFieldFilter[] | undefined,
): void {
  if (!filters?.length) {
    return;
  }

  for (const filter of normalizeCustomFieldFilters(filters)) {
    const value = serializeCustomFieldFilterValue(filter);
    if (!value) {
      continue;
    }
    out[customFieldFilterQueryKey(filter.fieldId)] = value;
  }
}

export function parseCustomFieldFiltersFromSearchParams(
  searchParams: URLSearchParams,
): ProductsListCustomFieldFilter[] {
  const filters: ProductsListCustomFieldFilter[] = [];

  searchParams.forEach((rawValue, key) => {
    const fieldId = parseCustomFieldFilterQueryKey(key);
    if (fieldId == null) {
      return;
    }
    const parsed = parseCustomFieldFilterValue(fieldId, rawValue);
    if (parsed) {
      filters.push(parsed);
    }
  });

  return normalizeCustomFieldFilters(filters);
}

export function writeCustomFieldFiltersToSearchParams(
  searchParams: URLSearchParams,
  filters: ProductsListCustomFieldFilter[],
): void {
  for (const filter of normalizeCustomFieldFilters(filters)) {
    const value = serializeCustomFieldFilterValue(filter);
    if (!value) {
      continue;
    }
    searchParams.set(customFieldFilterQueryKey(filter.fieldId), value);
  }
}

export function getDraftCustomFieldFilter(
  filters: ProductsListCustomFieldFilter[],
  fieldId: number,
): ProductsListCustomFieldFilter | undefined {
  return filters.find((filter) => filter.fieldId === fieldId);
}

export function upsertDraftCustomFieldFilter(
  filters: ProductsListCustomFieldFilter[],
  next: ProductsListCustomFieldFilter | null,
  fieldId: number,
): ProductsListCustomFieldFilter[] {
  const without = filters.filter((filter) => filter.fieldId !== fieldId);
  if (next == null) {
    return normalizeCustomFieldFilters(without);
  }
  return normalizeCustomFieldFilters([...without, next]);
}

export type CustomFieldFilterFieldMeta = {
  id: number;
  type: "options" | "text";
  archivedAt?: string | null;
  optionIds?: readonly number[];
};

export function coerceCustomFieldFilterToFieldType(
  filter: ProductsListCustomFieldFilter,
  field: CustomFieldFilterFieldMeta | undefined,
): ProductsListCustomFieldFilter | null {
  if (!field || field.archivedAt != null) {
    return filter;
  }

  if (filter.mode === "all") {
    return filter;
  }

  if (field.type === "text") {
    if (filter.mode === "text") {
      const value = filter.value.trim();
      return value ? { fieldId: filter.fieldId, mode: "text", value } : null;
    }
    return {
      fieldId: filter.fieldId,
      mode: "text",
      value: filter.optionIds.join(","),
    };
  }

  if (filter.mode === "options") {
    const allowed = field.optionIds ? new Set(field.optionIds) : null;
    const optionIds = filter.optionIds.filter((id) =>
      allowed ? allowed.has(id) : true,
    );
    return optionIds.length > 0
      ? { fieldId: filter.fieldId, mode: "options", optionIds }
      : null;
  }

  return null;
}

export function coerceCustomFieldFiltersToFields(
  filters: ProductsListCustomFieldFilter[],
  fields: readonly CustomFieldFilterFieldMeta[],
): ProductsListCustomFieldFilter[] {
  if (fields.length === 0) {
    return normalizeCustomFieldFilters(filters);
  }

  const fieldById = new Map(fields.map((field) => [field.id, field]));
  const coerced: ProductsListCustomFieldFilter[] = [];

  for (const filter of filters) {
    const next = coerceCustomFieldFilterToFieldType(
      filter,
      fieldById.get(filter.fieldId),
    );
    if (next) {
      coerced.push(next);
    }
  }

  return normalizeCustomFieldFilters(coerced);
}
