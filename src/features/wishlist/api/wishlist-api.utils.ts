import { asRecord, getNumber } from "@/api/record-parsing";
import { normalizeProduct } from "@/features/products/api/products-api";

import type {
  ClientWishlistProductsResponse,
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
