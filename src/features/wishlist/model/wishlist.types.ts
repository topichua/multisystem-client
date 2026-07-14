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
