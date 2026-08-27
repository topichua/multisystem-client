import { asBoolean, asNumber, asString, isRecord } from "@/api/record-parsing";
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

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeOptionalPositiveNumber(value: unknown): number | null {
  const parsed = asNumber(value);
  return parsed != null && parsed > 0 ? parsed : null;
}

function normalizeLastOrderAt(value: unknown): string | null {
  return asString(value) || null;
}

export function normalizeClientOrderStats(
  value: unknown,
): ClientOrderStats | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    orderCount: asNumber(value.orderCount) ?? 0,
    totalSpent: asNumber(value.totalSpent) ?? 0,
    averageOrderPrice: asNumber(value.averageOrderPrice) ?? 0,
    lastOrderAt: normalizeLastOrderAt(value.lastOrderAt),
  };
}

export function normalizeClient(value: unknown): Client | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNumber(value.id);
  if (id == null) {
    return null;
  }

  const links = normalizeClientSocialLinks(value.links);

  return {
    id,
    firstName: asString(value.firstName) ?? "",
    lastName: asString(value.lastName) ?? "",
    createdAt: asString(value.createdAt) ?? "",
    phone: asString(value.phone) ?? "",
    note: asString(value.note),
    blocked: asBoolean(value.blocked) ?? false,
    instagramUserIds: normalizeStringArray(value.instagramUserIds),
    telegramUserIds: normalizeStringArray(value.telegramUserIds),
    instagramUsers: normalizeClientSocialUsers(value.instagramUsers),
    telegramUsers: normalizeClientSocialUsers(value.telegramUsers),
    links: links.length > 0 ? links : undefined,
    workspaceId: asNumber(value.workspaceId) ?? 0,
    avatar_src: asString(value.avatar_src),
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
      username: asString(item.username),
      fullName: asString(item.fullName),
      avatar: asString(item.avatar),
      conversationId: normalizeOptionalPositiveNumber(item.conversationId),
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
      conversationId: normalizeOptionalPositiveNumber(item.conversationId),
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

  const rawItems = Array.isArray(data.items) ? data.items : [];

  const items = rawItems
    .map((item) => normalizeClient(item))
    .filter((item): item is Client => item != null);

  const total = asNumber(data.total) ?? items.length;
  const page = asNumber(data.page) ?? 1;
  const pageSize = asNumber(data.pageSize) ?? (items.length || 50);

  return { items, total, page, pageSize };
}

export function normalizeClientLookupResponse(
  data: unknown,
): ClientLookupResponse {
  if (!isRecord(data)) {
    return { associated: false, status: "" };
  }

  const associated = asBoolean(data.associated) ?? false;
  const status = asString(data.status) ?? "";
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
