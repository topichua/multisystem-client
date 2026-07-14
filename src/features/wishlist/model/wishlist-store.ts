import { makeAutoObservable, runInAction } from "mobx";

import type { Product } from "@/features/products/model/product.types";
import { wishlistApi } from "@/features/wishlist/api/wishlist-api";
import type {
  AddToWishlistPayload,
  RemoveFromWishlistPayload,
  WishlistItem,
} from "@/features/wishlist/model/wishlist.types";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

type LoadClientWishlistOptions = {
  force?: boolean;
  silent?: boolean;
};

function wishlistVariantKey(productId: number, variantId: number): string {
  return `${productId}:${variantId}`;
}

export class WishlistStore {
  productsByClientId = new Map<number, Product[]>();
  productsLoadingByClientId = new Map<number, boolean>();
  productsErrorByClientId = new Map<number, string | null>();
  mutationLoadingKeys = new Set<string>();

  constructor() {
    makeAutoObservable(this);
  }

  getProducts = (clientId: number): Product[] =>
    this.productsByClientId.get(clientId) ?? [];

  isProductsLoading = (clientId: number): boolean =>
    this.productsLoadingByClientId.get(clientId) === true;

  getProductsError = (clientId: number): string | null =>
    this.productsErrorByClientId.get(clientId) ?? null;

  isMutating = (
    clientId: number,
    productId: number,
    variantId: number,
  ): boolean =>
    this.mutationLoadingKeys.has(
      `${clientId}:${wishlistVariantKey(productId, variantId)}`,
    );

  isInWishlist = (
    clientId: number,
    productId: number,
    variantId: number,
  ): boolean =>
    this.getProducts(clientId).some(
      (product) =>
        product.id === productId &&
        (product.variants ?? []).some((variant) => variant.id === variantId),
    );

  loadProducts = async (
    clientId: number,
    options?: LoadClientWishlistOptions,
  ): Promise<Product[]> => {
    const silent = options?.silent === true;
    const cached = this.productsByClientId.get(clientId);

    if (
      !options?.force &&
      cached != null &&
      !this.isProductsLoading(clientId)
    ) {
      return cached;
    }

    if (!silent) {
      runInAction(() => {
        this.productsLoadingByClientId.set(clientId, true);
        this.productsErrorByClientId.set(clientId, null);
      });
    }

    try {
      const response = await wishlistApi.getProducts(clientId);

      runInAction(() => {
        this.productsByClientId.set(clientId, response.items);
      });

      return response.items;
    } catch (e) {
      runInAction(() => {
        this.productsErrorByClientId.set(clientId, unknownErrorMessage(e));
      });
      throwLoadError(`Failed to load wishlist for client ${clientId}`, e);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.productsLoadingByClientId.set(clientId, false);
        });
      }
    }
  };

  addToWishlist = async (
    clientId: number,
    payload: AddToWishlistPayload,
  ): Promise<WishlistItem> => {
    const mutationKey = `${clientId}:${wishlistVariantKey(
      payload.productId,
      payload.variantId,
    )}`;

    runInAction(() => {
      this.mutationLoadingKeys.add(mutationKey);
    });

    try {
      const item = await wishlistApi.add(clientId, payload);
      await this.loadProducts(clientId, { force: true, silent: true });

      return item;
    } catch (e) {
      throwLoadError(
        `Failed to add product ${payload.productId} variant ${payload.variantId} to wishlist`,
        e,
      );
    } finally {
      runInAction(() => {
        this.mutationLoadingKeys.delete(mutationKey);
      });
    }
  };

  removeFromWishlist = async (
    clientId: number,
    payload: RemoveFromWishlistPayload,
  ): Promise<void> => {
    const mutationKey = `${clientId}:${wishlistVariantKey(
      payload.productId,
      payload.variantId,
    )}`;

    runInAction(() => {
      this.mutationLoadingKeys.add(mutationKey);
    });

    try {
      await wishlistApi.remove(clientId, payload);
      await this.loadProducts(clientId, { force: true, silent: true });
    } catch (e) {
      throwLoadError(
        `Failed to remove product ${payload.productId} variant ${payload.variantId} from wishlist`,
        e,
      );
    } finally {
      runInAction(() => {
        this.mutationLoadingKeys.delete(mutationKey);
      });
    }
  };
}
