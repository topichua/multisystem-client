import { apiClient } from "@/api/api-client";
import { asNumber, asRecord, asString, isRecord } from "@/api/record-parsing";

import {
  type CreateInitialStockRequest,
  type CreateInitialStockResponse,
  type CreateStockCorrectionRequest,
  type CreateStockCorrectionResponse,
  type CreateStockPurchaseRequest,
  type CreateStockPurchaseResponse,
  type CreateStockSupplyRequest,
  type CreateStockSupplyResponse,
  type GetInventoryHistoryMovementsParams,
  type GetStockSuppliesParams,
  INVENTORY_HISTORY_MOVEMENTS_DEFAULT_LIMIT,
  INVENTORY_MOVEMENTS_DEFAULT_LIMIT,
  type InventoryHistoryItem,
  type InventoryHistoryMovementsResponse,
  type InventoryHistoryMovement,
  type InventoryHistorySupplyItem,
  type InventoryHistorySupplyLine,
  type InventoryMovementsResponse,
  type InventoryVariantMovementsQuery,
  STOCK_SUPPLIES_DEFAULT_LIMIT,
  type StockSuppliesResponse,
  type StockSupplyCreatedBy,
  type StockSupplyLineItem,
  type StockSupplyListItem,
  type StockSupplyStatus,
  type UpdateStockSupplyRequest,
} from "../model/inventory.types";

const basePath = "/inventory";

const normalizeInventoryMovements = (
  data: unknown,
): InventoryMovementsResponse => {
  const record = asRecord(data);
  const items = Array.isArray(record.items)
    ? (record.items as InventoryMovementsResponse["items"])
    : [];

  return {
    items,
    total: asNumber(record.total) ?? items.length,
  };
};

const normalizeInventoryHistorySupplyLine = (
  raw: unknown,
): InventoryHistorySupplyLine | null => {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    productId: asNumber(raw.productId) ?? 0,
    productName: asString(raw.productName) ?? "",
    variantId: asNumber(raw.variantId) ?? 0,
    variantName: asString(raw.variantName) ?? "",
    sku: asString(raw.sku),
    quantityChange: asNumber(raw.quantityChange) ?? 0,
    purchasePrice: asNumber(raw.purchasePrice),
    stockBefore: asNumber(raw.stockBefore) ?? 0,
    stockAfter: asNumber(raw.stockAfter) ?? 0,
  };
};

const normalizeInventoryHistoryItem = (
  raw: unknown,
): InventoryHistoryItem | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const kind = raw.kind === "supply" ? "supply" : "movement";

  if (kind === "supply") {
    const items = Array.isArray(raw.items)
      ? raw.items
          .map(normalizeInventoryHistorySupplyLine)
          .filter((item): item is InventoryHistorySupplyLine => item != null)
      : [];

    return {
      kind: "supply",
      id: asNumber(raw.id) ?? 0,
      type: "supply",
      name: asString(raw.name),
      createdAt: asString(raw.createdAt) ?? "",
      comment: asString(raw.comment),
      user:
        raw.user && typeof raw.user === "object"
          ? (raw.user as InventoryHistorySupplyItem["user"])
          : null,
      itemsCount: asNumber(raw.itemsCount) ?? items.length,
      totalQuantityChange: asNumber(raw.totalQuantityChange) ?? 0,
      totalPurchaseCost: asNumber(raw.totalPurchaseCost),
      previewText: asString(raw.previewText),
      items,
    };
  }

  return {
    kind: "movement",
    id: asNumber(raw.id) ?? 0,
    type: (asString(raw.type) ??
      "simple_adjustment") as InventoryHistoryMovement["type"],
    createdAt: asString(raw.createdAt) ?? "",
    reason: asString(raw.reason),
    comment: asString(raw.comment),
    user:
      raw.user && typeof raw.user === "object"
        ? (raw.user as InventoryHistoryMovement["user"])
        : null,
    productId: asNumber(raw.productId) ?? 0,
    productName: asString(raw.productName) ?? "",
    variantId: asNumber(raw.variantId) ?? 0,
    variantName: asString(raw.variantName) ?? "",
    sku: asString(raw.sku),
    quantityChange: asNumber(raw.quantityChange) ?? 0,
    purchasePrice: asNumber(raw.purchasePrice),
    totalCostChange: asNumber(raw.totalCostChange),
    stockBefore: asNumber(raw.stockBefore) ?? 0,
    stockAfter: asNumber(raw.stockAfter) ?? 0,
  };
};

const normalizeInventoryHistoryMovements = (
  data: unknown,
): InventoryHistoryMovementsResponse => {
  const record = asRecord(data);
  const items = Array.isArray(record.items)
    ? record.items
        .map(normalizeInventoryHistoryItem)
        .filter((item): item is InventoryHistoryItem => item != null)
    : [];

  return {
    items,
    total: asNumber(record.total) ?? items.length,
  };
};

const normalizeStockSupplyStatus = (value: unknown): StockSupplyStatus => {
  return value === "applied" ? "applied" : "pending";
};

const normalizeStockSupplyCreatedBy = (
  raw: unknown,
): StockSupplyCreatedBy | null => {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    id: asNumber(raw.id) ?? 0,
    name: asString(raw.name) ?? "",
  };
};

const normalizeStockSupplyLine = (raw: unknown): StockSupplyLineItem | null => {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    productId: asNumber(raw.productId) ?? 0,
    productVariantId: asNumber(raw.productVariantId) ?? 0,
    quantity: asNumber(raw.quantity) ?? 0,
    buyPrice: asNumber(raw.buyPrice) ?? 0,
    productName: asString(raw.productName),
    variantName: asString(raw.variantName),
    sku: asString(raw.sku),
  };
};

const normalizeStockSupplyListItem = (
  raw: unknown,
): StockSupplyListItem | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const items = Array.isArray(raw.items)
    ? raw.items
        .map(normalizeStockSupplyLine)
        .filter((item): item is StockSupplyLineItem => item != null)
    : [];

  return {
    id: asNumber(raw.id) ?? 0,
    name: asString(raw.name) ?? "",
    status: normalizeStockSupplyStatus(raw.status),
    comment: asString(raw.comment),
    createdAt: asString(raw.createdAt) ?? "",
    appliedAt: asString(raw.appliedAt),
    createdBy: normalizeStockSupplyCreatedBy(raw.createdBy),
    positionsCount: asNumber(raw.positionsCount) ?? items.length,
    totalQuantity: asNumber(raw.totalQuantity) ?? 0,
    totalSum: asNumber(raw.totalSum) ?? 0,
    items,
  };
};

const requireStockSupply = (data: unknown): StockSupplyListItem => {
  const supply = normalizeStockSupplyListItem(data);

  if (!supply) {
    throw new Error("Invalid stock supply response");
  }

  return supply;
};

const normalizeStockSuppliesResponse = (
  data: unknown,
  fallbackLimit = STOCK_SUPPLIES_DEFAULT_LIMIT,
  fallbackOffset = 0,
): StockSuppliesResponse => {
  const record = asRecord(data);
  const items = Array.isArray(record.items)
    ? record.items
        .map(normalizeStockSupplyListItem)
        .filter((item): item is StockSupplyListItem => item != null)
    : [];

  return {
    items,
    total: asNumber(record.total) ?? items.length,
    limit: asNumber(record.limit) ?? fallbackLimit,
    offset: asNumber(record.offset) ?? fallbackOffset,
  };
};

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

  listHistoryMovements: async (
    params: GetInventoryHistoryMovementsParams = {},
  ): Promise<InventoryHistoryMovementsResponse> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/history-movements`,
      {
        params: {
          limit: INVENTORY_HISTORY_MOVEMENTS_DEFAULT_LIMIT,
          ...params,
        },
      },
    );

    return normalizeInventoryHistoryMovements(data);
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

  listStockSupplies: async (
    params: GetStockSuppliesParams = {},
  ): Promise<StockSuppliesResponse> => {
    const limit = params.limit ?? STOCK_SUPPLIES_DEFAULT_LIMIT;
    const offset = params.offset ?? 0;
    const { data } = await apiClient.get<unknown>(
      `${basePath}/stock/supplies`,
      {
        params: {
          ...params,
          limit,
          offset,
        },
      },
    );

    return normalizeStockSuppliesResponse(data, limit, offset);
  },

  getStockSupply: async (id: number): Promise<StockSupplyListItem> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/stock/supplies/${id}`,
    );

    return requireStockSupply(data);
  },

  updateStockSupply: async (
    id: number,
    payload: UpdateStockSupplyRequest,
  ): Promise<StockSupplyListItem> => {
    const { data } = await apiClient.patch<unknown>(
      `${basePath}/stock/supplies/${id}`,
      payload,
    );

    return requireStockSupply(data);
  },

  applyStockSupply: async (id: number): Promise<StockSupplyListItem> => {
    const { data } = await apiClient.post<unknown>(
      `${basePath}/stock/supplies/${id}/apply`,
    );

    return requireStockSupply(data);
  },

  deleteStockSupply: async (id: number): Promise<void> => {
    await apiClient.delete(`${basePath}/stock/supplies/${id}`);
  },
};
