import {
  isOrderSourceFilter,
  ORDERS_LIST_KEYWORD_MIN_LENGTH,
  ORDER_SOURCE_FILTER_VALUES,
  type OrderSourceFilter,
} from "@/features/orders/model/order-list.constants";

const defaultPageSize = 50;

export type OrdersListAppliedUrlState = {
  keyword: string;
  statusIds: number[];
  sources: OrderSourceFilter[];
  totalPriceFrom: number | null;
  totalPriceTo: number | null;
  createdFrom: string | null;
  createdTo: string | null;
  page: number;
  pageSize: number;
};

export function normalizeAppliedListKeyword(keyword: string): string {
  const trimmed = keyword.trim();
  return trimmed.length >= ORDERS_LIST_KEYWORD_MIN_LENGTH ? trimmed : "";
}

function parseOptionalNumber(raw: string | null): number | null {
  if (raw == null || raw === "") {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalPositiveInt(raw: string | null): number | null {
  if (raw == null || raw === "") {
    return null;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return null;
  }
  return n;
}

function parseOptionalIsoDate(raw: string | null): string | null {
  if (raw == null || raw === "") {
    return null;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function parseStatusIds(raw: string | null): number[] {
  if (!raw) {
    return [];
  }

  return [
    ...new Set(
      raw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value >= 1),
    ),
  ];
}

function parseSources(raw: string | null): OrderSourceFilter[] {
  if (!raw) {
    return [];
  }

  return [
    ...new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(isOrderSourceFilter),
    ),
  ];
}

export function parseOrdersListUrlSearchParams(
  searchParams: URLSearchParams,
): OrdersListAppliedUrlState {
  return {
    keyword: normalizeAppliedListKeyword(searchParams.get("keyword") ?? ""),
    statusIds: parseStatusIds(searchParams.get("statuses")),
    sources: parseSources(searchParams.get("sources")),
    totalPriceFrom: parseOptionalNumber(searchParams.get("totalPriceFrom")),
    totalPriceTo: parseOptionalNumber(searchParams.get("totalPriceTo")),
    createdFrom: parseOptionalIsoDate(searchParams.get("createdFrom")),
    createdTo: parseOptionalIsoDate(searchParams.get("createdTo")),
    page: Math.max(1, parseOptionalPositiveInt(searchParams.get("page")) ?? 1),
    pageSize: Math.min(
      100,
      Math.max(
        1,
        parseOptionalPositiveInt(searchParams.get("pageSize")) ??
          defaultPageSize,
      ),
    ),
  };
}

export function serializeOrdersListUrlSearchParams(
  state: OrdersListAppliedUrlState,
): URLSearchParams {
  const sp = new URLSearchParams();
  const keyword = normalizeAppliedListKeyword(state.keyword);

  if (keyword) {
    sp.set("keyword", keyword);
  }
  if (state.statusIds.length) {
    sp.set(
      "statuses",
      [...new Set(state.statusIds)].sort((a, b) => a - b).join(","),
    );
  }
  if (state.sources.length) {
    sp.set(
      "sources",
      [...new Set(state.sources)]
        .filter((source) =>
          (ORDER_SOURCE_FILTER_VALUES as readonly string[]).includes(source),
        )
        .sort()
        .join(","),
    );
  }
  if (state.totalPriceFrom != null) {
    sp.set("totalPriceFrom", String(state.totalPriceFrom));
  }
  if (state.totalPriceTo != null) {
    sp.set("totalPriceTo", String(state.totalPriceTo));
  }
  if (state.createdFrom) {
    sp.set("createdFrom", state.createdFrom);
  }
  if (state.createdTo) {
    sp.set("createdTo", state.createdTo);
  }
  if (state.page !== 1) {
    sp.set("page", String(state.page));
  }
  if (state.pageSize !== defaultPageSize) {
    sp.set("pageSize", String(state.pageSize));
  }

  return sp;
}

export function ordersListUrlSearchStringCanonical(
  sp: URLSearchParams,
): string {
  const pairs: [string, string][] = [];
  sp.forEach((value, key) => {
    pairs.push([key, value]);
  });
  return pairs
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

export function ordersListAppliedUrlStateEquals(
  a: OrdersListAppliedUrlState,
  b: OrdersListAppliedUrlState,
): boolean {
  const aStatusIds = [...a.statusIds].sort((x, y) => x - y);
  const bStatusIds = [...b.statusIds].sort((x, y) => x - y);
  const aSources = [...a.sources].sort();
  const bSources = [...b.sources].sort();

  return (
    a.keyword === b.keyword &&
    a.totalPriceFrom === b.totalPriceFrom &&
    a.totalPriceTo === b.totalPriceTo &&
    a.createdFrom === b.createdFrom &&
    a.createdTo === b.createdTo &&
    a.page === b.page &&
    a.pageSize === b.pageSize &&
    aStatusIds.length === bStatusIds.length &&
    aStatusIds.every((id, index) => id === bStatusIds[index]) &&
    aSources.length === bSources.length &&
    aSources.every((source, index) => source === bSources[index])
  );
}
