import { makeAutoObservable, runInAction } from "mobx";

import { wishlistApi } from "@/features/wishlist/api/wishlist-api";
import type {
  OpenVariantWishlistClientsParams,
  VariantWishlistResponse,
} from "@/features/wishlist/model/wishlist.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

export class VariantWishlistClientsStore {
  open = false;
  productId: number | null = null;
  variantId: number | null = null;
  subtitle: string | null = null;
  data: VariantWishlistResponse | null = null;
  loading = false;
  error: string | null = null;

  private requestId = 0;

  constructor() {
    makeAutoObservable(this);
  }

  openDrawer = (params: OpenVariantWishlistClientsParams): void => {
    const subtitle = params.subtitle?.trim() || null;

    this.requestId += 1;
    this.open = true;
    this.productId = params.productId;
    this.variantId = params.variantId;
    this.subtitle = subtitle;
    this.data = null;
    this.error = null;
    this.loading = true;

    void this.load(this.requestId);
  };

  closeDrawer = (): void => {
    this.requestId += 1;
    this.open = false;
    this.loading = false;
    this.error = null;
  };

  retry = (): void => {
    if (this.productId == null || this.variantId == null) {
      return;
    }

    this.requestId += 1;
    this.loading = true;
    this.error = null;
    void this.load(this.requestId);
  };

  private load = async (requestId: number): Promise<void> => {
    const productId = this.productId;
    const variantId = this.variantId;

    if (productId == null || variantId == null) {
      return;
    }

    try {
      const data = await wishlistApi.getVariantWishlist(productId, variantId);

      if (requestId !== this.requestId) {
        return;
      }

      runInAction(() => {
        this.data = data;
        this.error = null;
        this.loading = false;
      });
    } catch (error) {
      if (requestId !== this.requestId) {
        return;
      }

      runInAction(() => {
        this.data = null;
        this.error = unknownErrorMessage(error);
        this.loading = false;
      });
    }
  };
}
