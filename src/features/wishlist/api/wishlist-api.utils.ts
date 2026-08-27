import { asNumber, asRecord, asString } from "@/api/record-parsing";
import { normalizeClient } from "@/features/clients/api/clients-api.utils";
import { normalizeProduct } from "@/features/products/api/products-api";

import type {
  ClientWishlistProductsResponse,
  VariantWishlistClient,
  VariantWishlistItem,
  VariantWishlistResponse,
  WishlistClientSocialUser,
  WishlistItem,
} from "../model/wishlist.types";

export function normalizeWishlistItem(raw: unknown): WishlistItem {
  const record = asRecord(raw);

  return {
    id: asNumber(record.id) ?? 0,
    productId: asNumber(record.productId) ?? 0,
    variantId: asNumber(record.variantId) ?? 0,
    at: asString(record.at) ?? "",
    createdBy: asNumber(record.createdBy) ?? 0,
    conversationId: asNumber(record.conversationId),
  };
}

export function normalizeClientWishlistProducts(
  raw: unknown,
): ClientWishlistProductsResponse {
  const record = asRecord(raw);
  const items = Array.isArray(record.items)
    ? record.items.map((item) => normalizeProduct(item))
    : [];

  return {
    clientId: asNumber(record.clientId) ?? 0,
    items,
  };
}

function normalizeWishlistClientSocialUser(
  raw: unknown,
): WishlistClientSocialUser | null {
  const record = asRecord(raw);
  const id = asString(record.id);

  if (!id) {
    return null;
  }

  return {
    id,
    username: asString(record.username),
    fullName: asString(record.fullName),
    avatar: asString(record.avatar),
  };
}

function normalizeWishlistClientSocialUsers(
  raw: unknown,
): WishlistClientSocialUser[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeWishlistClientSocialUser(item))
    .filter((item): item is WishlistClientSocialUser => item != null);
}

function normalizeVariantWishlistClient(
  raw: unknown,
): VariantWishlistClient | null {
  const client = normalizeClient(raw);

  if (!client) {
    return null;
  }

  const record = asRecord(raw);

  return {
    ...client,
    note: asString(record.note),
    instagramUsers: normalizeWishlistClientSocialUsers(record.instagramUsers),
    telegramUsers: normalizeWishlistClientSocialUsers(record.telegramUsers),
  };
}

export function normalizeVariantWishlistItem(
  raw: unknown,
): VariantWishlistItem | null {
  const record = asRecord(raw);
  const client = normalizeVariantWishlistClient(record.client);

  if (!client) {
    return null;
  }

  return {
    id: asNumber(record.id) ?? 0,
    at: asString(record.at) ?? "",
    conversationId: asNumber(record.conversationId),
    client,
  };
}

export function normalizeVariantWishlistResponse(
  raw: unknown,
): VariantWishlistResponse {
  const record = asRecord(raw);
  const items = Array.isArray(record.items)
    ? record.items
        .map((item) => normalizeVariantWishlistItem(item))
        .filter((item): item is VariantWishlistItem => item != null)
    : [];

  return {
    productId: asNumber(record.productId) ?? 0,
    variantId: asNumber(record.variantId) ?? 0,
    total: asNumber(record.total) ?? items.length,
    items,
  };
}
