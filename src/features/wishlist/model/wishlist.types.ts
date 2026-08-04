import type { Client } from "@/features/clients/model/client.types";
import type { Product } from "@/features/products/model/product.types";

export type WishlistItem = {
  id: number;
  productId: number;
  variantId: number;
  at: string;
  createdBy: number;
  conversationId: number | null;
};

export type ClientWishlistProductsResponse = {
  clientId: number;
  items: Product[];
};

export type AddToWishlistPayload = {
  productId: number;
  variantId: number;
  at?: string;
  conversationId?: number;
};

export type RemoveFromWishlistPayload = {
  productId: number;
  variantId: number;
};

export type WishlistClientSocialUser = {
  id: string;
  username: string | null;
  fullName: string | null;
  avatar: string | null;
};

export type VariantWishlistClient = Client & {
  note: string | null;
  instagramUsers: WishlistClientSocialUser[];
  telegramUsers: WishlistClientSocialUser[];
};

export type VariantWishlistItem = {
  id: number;
  at: string;
  conversationId: number | null;
  client: VariantWishlistClient;
};

export type VariantWishlistResponse = {
  productId: number;
  variantId: number;
  total: number;
  items: VariantWishlistItem[];
};

export type OpenVariantWishlistClientsParams = {
  productId: number;
  variantId: number;
  subtitle?: string | null;
};
