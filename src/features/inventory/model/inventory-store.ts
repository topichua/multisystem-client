import { makeAutoObservable, runInAction } from "mobx";

import { inventoryApi } from "@/features/inventory/api/inventory-api";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  CreateInitialStockRequest,
  CreateInitialStockResponse,
  CreateStockCorrectionRequest,
  CreateStockCorrectionResponse,
  CreateStockMovementResponse,
  CreateStockPurchaseRequest,
  CreateStockPurchaseResponse,
  InventoryMovement,
  InventoryMovementsResponse,
} from "./inventory.types";

type LoadVariantMovementsOptions = {
  limit?: number;
  force?: boolean;
};

function mergeMovement(
  current: InventoryMovementsResponse | undefined,
  movement: InventoryMovement,
): InventoryMovementsResponse {
  if (!current) {
    return { items: [movement], total: 1 };
  }

  const exists = current.items.some((item) => item.id === movement.id);

  return {
    items: [
      movement,
      ...current.items.filter((item) => item.id !== movement.id),
    ],
    total: current.total + (exists ? 0 : 1),
  };
}

export class InventoryStore {
  variantMovementsByVariantId = new Map<number, InventoryMovementsResponse>();
  variantMovementsLoadingByVariantId = new Map<number, boolean>();
  variantMovementsErrorByVariantId = new Map<number, string | null>();
  initialStockSubmittingByVariantId = new Map<number, boolean>();
  initialStockErrorByVariantId = new Map<number, string | null>();
  stockMovementSubmittingByVariantId = new Map<number, boolean>();
  stockMovementErrorByVariantId = new Map<number, string | null>();

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

  isInitialStockSubmitting = (variantId: number): boolean =>
    this.initialStockSubmittingByVariantId.get(variantId) === true;

  getInitialStockError = (variantId: number): string | null =>
    this.initialStockErrorByVariantId.get(variantId) ?? null;

  isStockMovementSubmitting = (variantId: number): boolean =>
    this.stockMovementSubmittingByVariantId.get(variantId) === true;

  getStockMovementError = (variantId: number): string | null =>
    this.stockMovementErrorByVariantId.get(variantId) ?? null;

  applyStockMovementResponse = (
    variantId: number,
    response: CreateStockMovementResponse,
  ) => {
    const current = this.variantMovementsByVariantId.get(variantId);

    this.variantMovementsErrorByVariantId.set(variantId, null);
    this.variantMovementsByVariantId.set(
      variantId,
      mergeMovement(current, response.movement),
    );
  };

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

  createInitialStock = async (
    payload: CreateInitialStockRequest,
  ): Promise<CreateInitialStockResponse> => {
    runInAction(() => {
      this.initialStockSubmittingByVariantId.set(payload.variantId, true);
      this.initialStockErrorByVariantId.set(payload.variantId, null);
    });

    try {
      const response = await inventoryApi.createInitialStock(payload);

      runInAction(() => {
        this.applyStockMovementResponse(payload.variantId, response);
      });

      return response;
    } catch (e) {
      runInAction(() => {
        this.initialStockErrorByVariantId.set(
          payload.variantId,
          unknownErrorMessage(e),
        );
      });
      throwLoadError(
        `Failed to create initial stock for variant ${payload.variantId}`,
        e,
      );
    } finally {
      runInAction(() => {
        this.initialStockSubmittingByVariantId.set(payload.variantId, false);
      });
    }
  };

  createStockPurchase = async (
    payload: CreateStockPurchaseRequest,
  ): Promise<CreateStockPurchaseResponse> => {
    runInAction(() => {
      this.stockMovementSubmittingByVariantId.set(payload.variantId, true);
      this.stockMovementErrorByVariantId.set(payload.variantId, null);
    });

    try {
      const response = await inventoryApi.createStockPurchase(payload);

      runInAction(() => {
        this.applyStockMovementResponse(payload.variantId, response);
      });

      return response;
    } catch (e) {
      runInAction(() => {
        this.stockMovementErrorByVariantId.set(
          payload.variantId,
          unknownErrorMessage(e),
        );
      });
      throwLoadError(
        `Failed to create stock purchase for variant ${payload.variantId}`,
        e,
      );
    } finally {
      runInAction(() => {
        this.stockMovementSubmittingByVariantId.set(payload.variantId, false);
      });
    }
  };

  createStockCorrection = async (
    payload: CreateStockCorrectionRequest,
  ): Promise<CreateStockCorrectionResponse> => {
    runInAction(() => {
      this.stockMovementSubmittingByVariantId.set(payload.variantId, true);
      this.stockMovementErrorByVariantId.set(payload.variantId, null);
    });

    try {
      const response = await inventoryApi.createStockCorrection(payload);

      runInAction(() => {
        this.applyStockMovementResponse(payload.variantId, response);
      });

      return response;
    } catch (e) {
      runInAction(() => {
        this.stockMovementErrorByVariantId.set(
          payload.variantId,
          unknownErrorMessage(e),
        );
      });
      throwLoadError(
        `Failed to create stock correction for variant ${payload.variantId}`,
        e,
      );
    } finally {
      runInAction(() => {
        this.stockMovementSubmittingByVariantId.set(payload.variantId, false);
      });
    }
  };
}
