import { makeAutoObservable, runInAction } from "mobx";

import { inventoryApi } from "@/features/inventory/api/inventory-api";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type { InventoryMovementsResponse } from "./inventory.types";

type LoadVariantMovementsOptions = {
  limit?: number;
  force?: boolean;
};

export class InventoryStore {
  variantMovementsByVariantId = new Map<number, InventoryMovementsResponse>();
  variantMovementsLoadingByVariantId = new Map<number, boolean>();
  variantMovementsErrorByVariantId = new Map<number, string | null>();

  constructor() {
    makeAutoObservable(this);
  }

  getVariantMovements = (
    variantId: number,
  ): InventoryMovementsResponse | null =>
    this.variantMovementsByVariantId.get(variantId) ?? null;

  isVariantMovementsLoading = (variantId: number): boolean =>
    this.variantMovementsLoadingByVariantId.get(variantId) === true;

  getVariantMovementsError = (variantId: number): string | null =>
    this.variantMovementsErrorByVariantId.get(variantId) ?? null;

  loadVariantMovements = async (
    variantId: number,
    options?: LoadVariantMovementsOptions,
  ): Promise<InventoryMovementsResponse> => {
    const cached = this.variantMovementsByVariantId.get(variantId);

    if (!options?.force && cached) {
      return cached;
    }

    if (
      !options?.force &&
      this.variantMovementsLoadingByVariantId.get(variantId)
    ) {
      return cached ?? { items: [], total: 0 };
    }

    runInAction(() => {
      this.variantMovementsLoadingByVariantId.set(variantId, true);
      this.variantMovementsErrorByVariantId.set(variantId, null);
    });

    try {
      const response = await inventoryApi.listVariantMovements({
        variantId,
        limit: options?.limit,
      });

      runInAction(() => {
        this.variantMovementsByVariantId.set(variantId, response);
      });

      return response;
    } catch (e) {
      runInAction(() => {
        this.variantMovementsErrorByVariantId.set(
          variantId,
          unknownErrorMessage(e),
        );
      });
      throwLoadError(
        `Failed to load inventory movements for variant ${variantId}`,
        e,
      );
    } finally {
      runInAction(() => {
        this.variantMovementsLoadingByVariantId.set(variantId, false);
      });
    }
  };
}
