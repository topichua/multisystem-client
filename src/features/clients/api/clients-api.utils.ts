import type {
  Client,
  ClientLookupResponse,
  ClientOrderStats,
  ClientsGetParams,
  ClientsListQueryParams,
  ClientsListResponse,
  ClientsLookupParams,
} from "@/features/clients/model/client.types";

export const CLIENTS_LOOKUP_PARAM_KEYS = [
  "id",
  "instagramUserId",
  "instagramId",
  "telegramUserId",
] as const;

export type ClientsLookupParamKey = (typeof CLIENTS_LOOKUP_PARAM_KEYS)[number];

export class ClientsApiParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientsApiParamsError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeLastOrderAt(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return null;
}

export function normalizeClientOrderStats(
  value: unknown,
): ClientOrderStats | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    orderCount: typeof value.orderCount === "number" ? value.orderCount : 0,
    totalSpent: typeof value.totalSpent === "number" ? value.totalSpent : 0,
    averageOrderPrice:
      typeof value.averageOrderPrice === "number" ? value.averageOrderPrice : 0,
    lastOrderAt: normalizeLastOrderAt(value.lastOrderAt),
  };
}

export function normalizeClient(value: unknown): Client | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "number") {
    return null;
  }

  return {
    id: value.id,
    firstName: typeof value.firstName === "string" ? value.firstName : "",
    lastName: typeof value.lastName === "string" ? value.lastName : "",
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    phone: typeof value.phone === "string" ? value.phone : "",
    instagramUserIds: normalizeStringArray(value.instagramUserIds),
    telegramUserIds: normalizeStringArray(value.telegramUserIds),
    workspaceId: typeof value.workspaceId === "number" ? value.workspaceId : 0,
    avatar_src: typeof value.avatar_src === "string" ? value.avatar_src : null,
    orderStats: normalizeClientOrderStats(value.orderStats),
  };
}

export function normalizeClientsListResponse(
  data: unknown,
): ClientsListResponse {
  if (Array.isArray(data)) {
    const items = data
      .map((item) => normalizeClient(item))
      .filter((item): item is Client => item != null);

    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length > 0 ? items.length : 50,
    };
  }

  if (!isRecord(data)) {
    return { items: [], total: 0, page: 1, pageSize: 50 };
  }

  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.clients)
      ? data.clients
      : [];

  const items = rawItems
    .map((item) => normalizeClient(item))
    .filter((item): item is Client => item != null);

  const total = typeof data.total === "number" ? data.total : items.length;
  const page = typeof data.page === "number" ? data.page : 1;
  const pageSize =
    typeof data.pageSize === "number" ? data.pageSize : items.length || 50;

  return { items, total, page, pageSize };
}

export function normalizeClientLookupResponse(
  data: unknown,
): ClientLookupResponse {
  if (!isRecord(data)) {
    return { associated: false, status: "" };
  }

  const associated = Boolean(data.associated);
  const status = typeof data.status === "string" ? data.status : "";
  const client = normalizeClient(data.client) ?? undefined;

  return client !== undefined
    ? { associated, status, client }
    : { associated, status };
}

export function isClientLookupResponse(
  value: ClientsListResponse | ClientLookupResponse,
): value is ClientLookupResponse {
  return "associated" in value;
}

export function getActiveClientsLookupKeys(
  params: ClientsGetParams,
): ClientsLookupParamKey[] {
  const activeKeys: ClientsLookupParamKey[] = [];

  for (const key of CLIENTS_LOOKUP_PARAM_KEYS) {
    const value = params[key];

    if (value != null && value !== "") {
      activeKeys.push(key);
    }
  }

  return activeKeys;
}

export function isClientsLookupParams(
  params: ClientsGetParams,
): params is ClientsLookupParams {
  return getActiveClientsLookupKeys(params).length === 1;
}

export function assertValidClientsGetParams(params: ClientsGetParams): void {
  const activeLookupKeys = getActiveClientsLookupKeys(params);

  if (activeLookupKeys.length > 1) {
    throw new ClientsApiParamsError(
      `Only one lookup parameter is allowed, received: ${activeLookupKeys.join(", ")}`,
    );
  }
}

export function buildClientsGetQueryParams(
  params: ClientsGetParams = {},
): Record<string, string | number | boolean> {
  assertValidClientsGetParams(params);

  const activeLookupKeys = getActiveClientsLookupKeys(params);

  if (activeLookupKeys.length === 1) {
    const key = activeLookupKeys[0];
    const value = params[key];

    if (key === "id") {
      return { id: Number(value) };
    }

    return { [key]: String(value) };
  }

  const listParams = params as ClientsListQueryParams;
  const query: Record<string, string | number | boolean> = {
    page: listParams.page ?? 1,
    pageSize: listParams.pageSize ?? 50,
  };

  if (listParams.include_order_stat === true) {
    query.include_order_stat = true;
  }

  return query;
}
