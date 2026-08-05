import type {
  Client,
  ClientLookupResponse,
  ClientOrderStats,
  ClientSocialLinkRecord,
  ClientSocialUserRecord,
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

function normalizeNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeOptionalPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
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

  const links = normalizeClientSocialLinks(value.links);

  return {
    id: value.id,
    firstName: typeof value.firstName === "string" ? value.firstName : "",
    lastName: typeof value.lastName === "string" ? value.lastName : "",
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    phone: typeof value.phone === "string" ? value.phone : "",
    note: normalizeNullableString(value.note),
    blocked: typeof value.blocked === "boolean" ? value.blocked : false,
    instagramUserIds: normalizeStringArray(value.instagramUserIds),
    telegramUserIds: normalizeStringArray(value.telegramUserIds),
    instagramUsers: normalizeClientSocialUsers(value.instagramUsers),
    telegramUsers: normalizeClientSocialUsers(value.telegramUsers),
    links: links.length > 0 ? links : undefined,
    workspaceId: typeof value.workspaceId === "number" ? value.workspaceId : 0,
    avatar_src:
      typeof value.avatar_src === "string"
        ? value.avatar_src
        : typeof value.avatarSrc === "string"
          ? value.avatarSrc
          : null,
    orderStats: normalizeClientOrderStats(value.orderStats),
  };
}

function normalizeClientSocialUsers(value: unknown): ClientSocialUserRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const users: ClientSocialUserRecord[] = [];

  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== "string" || !item.id.trim()) {
      continue;
    }

    users.push({
      id: item.id.trim(),
      username: normalizeNullableString(item.username),
      fullName: normalizeNullableString(item.fullName),
      avatar: normalizeNullableString(item.avatar),
      conversationId: normalizeOptionalPositiveNumber(
        item.conversationId ?? item.conversation_id,
      ),
    });
  }

  return users;
}

function normalizeClientSocialLinks(value: unknown): ClientSocialLinkRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const links: ClientSocialLinkRecord[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const provider = item.provider;
    const externalId = item.externalId;

    if (
      (provider !== "instagram" && provider !== "telegram") ||
      typeof externalId !== "string" ||
      !externalId.trim()
    ) {
      continue;
    }

    links.push({
      provider,
      externalId: externalId.trim(),
      username:
        typeof item.username === "string" && item.username.trim()
          ? item.username.trim()
          : null,
      conversationId: normalizeOptionalPositiveNumber(
        item.conversationId ?? item.conversation_id,
      ),
    });
  }

  return links;
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
    const query: Record<string, string | number | boolean> =
      key === "id" ? { id: Number(value) } : { [key]: String(value) };

    if (params.include_order_stat === true) {
      query.include_order_stat = true;
    }

    return query;
  }

  const listParams = params as ClientsListQueryParams;
  const query: Record<string, string | number | boolean> = {
    page: listParams.page ?? 1,
    pageSize: listParams.pageSize ?? 50,
  };

  if (listParams.include_order_stat === true) {
    query.include_order_stat = true;
  }

  const keyword = listParams.keyword?.trim();
  if (keyword) {
    query.keyword = keyword;
  }

  if (listParams.blocked && listParams.blocked !== "all") {
    query.blocked = listParams.blocked;
  }

  const createdFrom = listParams.createdFrom?.trim();
  if (createdFrom) {
    query.createdFrom = createdFrom;
  }

  const createdTo = listParams.createdTo?.trim();
  if (createdTo) {
    query.createdTo = createdTo;
  }

  const lastOrderFrom = listParams.lastOrderFrom?.trim();
  if (lastOrderFrom) {
    query.lastOrderFrom = lastOrderFrom;
  }

  const lastOrderTo = listParams.lastOrderTo?.trim();
  if (lastOrderTo) {
    query.lastOrderTo = lastOrderTo;
  }

  return query;
}
