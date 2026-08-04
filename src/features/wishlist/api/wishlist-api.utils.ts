import { asRecord, getNumber, getString } from "@/api/record-parsing";
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
    id: getNumber(record, ["id"]) ?? 0,
    productId: getNumber(record, ["productId", "product_id"]) ?? 0,
    variantId: getNumber(record, ["variantId", "variant_id"]) ?? 0,
    at: typeof record.at === "string" ? record.at : "",
    createdBy: getNumber(record, ["createdBy", "created_by"]) ?? 0,
    conversationId: getNumber(record, ["conversationId", "conversation_id"]),
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
    clientId: getNumber(record, ["clientId", "client_id"]) ?? 0,
    items,
  };
}

function normalizeWishlistClientSocialUser(
  raw: unknown,
): WishlistClientSocialUser | null {
  const record = asRecord(raw);
  const id = getString(record, ["id"]);

  if (!id) {
    return null;
  }

  return {
    id,
    username: getString(record, ["username"]),
    fullName: getString(record, ["fullName", "full_name"]),
    avatar: getString(record, ["avatar"]),
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
    note: getString(record, ["note"]),
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
    id: getNumber(record, ["id"]) ?? 0,
    at: typeof record.at === "string" ? record.at : "",
    conversationId: getNumber(record, ["conversationId", "conversation_id"]),
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
    productId: getNumber(record, ["productId", "product_id"]) ?? 0,
    variantId: getNumber(record, ["variantId", "variant_id"]) ?? 0,
    total: getNumber(record, ["total"]) ?? items.length,
    items,
  };
}
