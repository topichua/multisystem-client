import { apiClient } from "@/api/api-client";

import {
  type CreateInitialStockRequest,
  type CreateInitialStockResponse,
  type CreateStockCorrectionRequest,
  type CreateStockCorrectionResponse,
  type CreateStockPurchaseRequest,
  type CreateStockPurchaseResponse,
  type CreateStockSupplyRequest,
  type CreateStockSupplyResponse,
  INVENTORY_MOVEMENTS_DEFAULT_LIMIT,
  type InventoryMovementsResponse,
  type InventoryVariantMovementsQuery,
} from "../model/inventory.types";

const basePath = "/inventory";

function normalizeInventoryMovements(
  data: unknown,
): InventoryMovementsResponse {
  if (!data || typeof data !== "object") {
    return { items: [], total: 0 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? (record.items as InventoryMovementsResponse["items"])
    : [];
  const total = typeof record.total === "number" ? record.total : items.length;

  return { items, total };
}

export const inventoryApi = {
  listVariantMovements: async ({
    variantId,
    limit = INVENTORY_MOVEMENTS_DEFAULT_LIMIT,
  }: InventoryVariantMovementsQuery): Promise<InventoryMovementsResponse> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/variants/${variantId}/movements`,
      {
        params: { limit },
      },
    );

    return normalizeInventoryMovements(data);
  },

  createInitialStock: async (
    payload: CreateInitialStockRequest,
  ): Promise<CreateInitialStockResponse> => {
    const { data } = await apiClient.post<CreateInitialStockResponse>(
      `${basePath}/stock/initial`,
      payload,
    );

    return data;
  },

  createStockPurchase: async (
    payload: CreateStockPurchaseRequest,
  ): Promise<CreateStockPurchaseResponse> => {
    const { data } = await apiClient.post<CreateStockPurchaseResponse>(
      `${basePath}/stock/purchase`,
      payload,
    );

    return data;
  },

  createStockCorrection: async (
    payload: CreateStockCorrectionRequest,
  ): Promise<CreateStockCorrectionResponse> => {
    const { data } = await apiClient.post<CreateStockCorrectionResponse>(
      `${basePath}/stock/correction`,
      payload,
    );

    return data;
  },

  createStockSupply: async (
    payload: CreateStockSupplyRequest,
  ): Promise<CreateStockSupplyResponse> => {
    const { data } = await apiClient.post<CreateStockSupplyResponse>(
      `${basePath}/stock/supplies`,
      payload,
    );

    return data;
  },
};
