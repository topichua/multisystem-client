import { apiClient } from "@/api/api-client";

import type {
  AddToWishlistPayload,
  ClientWishlistProductsResponse,
  RemoveFromWishlistPayload,
  WishlistItem,
} from "../model/wishlist.types";

import {
  normalizeClientWishlistProducts,
  normalizeWishlistItem,
} from "./wishlist-api.utils";

function clientWishlistPath(clientId: number): string {
  return `/clients/${clientId}/wishlist`;
}

export const wishlistApi = {
  getProducts: async (
    clientId: number,
  ): Promise<ClientWishlistProductsResponse> => {
    const { data } = await apiClient.get<unknown>(
      `${clientWishlistPath(clientId)}/products`,
    );

    return normalizeClientWishlistProducts(data);
  },

  add: async (
    clientId: number,
    payload: AddToWishlistPayload,
  ): Promise<WishlistItem> => {
    const { data } = await apiClient.post<unknown>(
      clientWishlistPath(clientId),
      payload,
    );

    return normalizeWishlistItem(data);
  },

  remove: async (
    clientId: number,
    payload: RemoveFromWishlistPayload,
  ): Promise<void> => {
    await apiClient.delete<unknown>(clientWishlistPath(clientId), {
      data: payload,
    });
  },
};
