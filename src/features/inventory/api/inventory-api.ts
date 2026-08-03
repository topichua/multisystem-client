import { apiClient } from "@/api/api-client";

import {
  type CreateInitialStockRequest,
  type CreateInitialStockResponse,
  type CreateStockCorrectionRequest,
  type CreateStockCorrectionResponse,
  type CreateStockPurchaseRequest,
  type CreateStockPurchaseResponse,
  type CreateStockSupplyItem,
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
  type StockSupplyListItem,
  type StockSupplyStatus,
} from "../model/inventory.types";

const basePath = "/inventory";

const normalizeInventoryMovements = (
  data: unknown,
): InventoryMovementsResponse => {
  if (!data || typeof data !== "object") {
    return { items: [], total: 0 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? (record.items as InventoryMovementsResponse["items"])
    : [];
  const total = typeof record.total === "number" ? record.total : items.length;

  return { items, total };
};

const normalizeInventoryHistorySupplyLine = (
  raw: unknown,
): InventoryHistorySupplyLine | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;

  return {
    productId: Number(record.productId ?? 0),
    productName: String(record.productName ?? ""),
    variantId: Number(record.variantId ?? 0),
    variantName: String(record.variantName ?? ""),
    sku: typeof record.sku === "string" ? record.sku : null,
    quantityChange: Number(record.quantityChange ?? 0),
    purchasePrice:
      typeof record.purchasePrice === "number" ? record.purchasePrice : null,
    stockBefore: Number(record.stockBefore ?? 0),
    stockAfter: Number(record.stockAfter ?? 0),
  };
};

const normalizeInventoryHistoryItem = (
  raw: unknown,
): InventoryHistoryItem | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const kind = record.kind === "supply" ? "supply" : "movement";

  if (kind === "supply") {
    const items = Array.isArray(record.items)
      ? record.items
          .map(normalizeInventoryHistorySupplyLine)
          .filter((item): item is InventoryHistorySupplyLine => item != null)
      : [];

    return {
      kind: "supply",
      id: Number(record.id ?? 0),
      type: "supply",
      createdAt: String(record.createdAt ?? ""),
      comment: typeof record.comment === "string" ? record.comment : null,
      user:
        record.user && typeof record.user === "object"
          ? (record.user as InventoryHistorySupplyItem["user"])
          : null,
      itemsCount: Number(record.itemsCount ?? items.length),
      totalQuantityChange: Number(record.totalQuantityChange ?? 0),
      totalPurchaseCost:
        typeof record.totalPurchaseCost === "number"
          ? record.totalPurchaseCost
          : null,
      previewText:
        typeof record.previewText === "string" ? record.previewText : null,
      items,
    };
  }

  return {
    kind: "movement",
    id: Number(record.id ?? 0),
    type: String(
      record.type ?? "simple_adjustment",
    ) as InventoryHistoryMovement["type"],
    createdAt: String(record.createdAt ?? ""),
    reason: typeof record.reason === "string" ? record.reason : null,
    comment: typeof record.comment === "string" ? record.comment : null,
    user:
      record.user && typeof record.user === "object"
        ? (record.user as InventoryHistoryMovement["user"])
        : null,
    productId: Number(record.productId ?? 0),
    productName: String(record.productName ?? ""),
    variantId: Number(record.variantId ?? 0),
    variantName: String(record.variantName ?? ""),
    sku: typeof record.sku === "string" ? record.sku : null,
    quantityChange: Number(record.quantityChange ?? 0),
    purchasePrice:
      typeof record.purchasePrice === "number" ? record.purchasePrice : null,
    totalCostChange:
      typeof record.totalCostChange === "number"
        ? record.totalCostChange
        : null,
    stockBefore: Number(record.stockBefore ?? 0),
    stockAfter: Number(record.stockAfter ?? 0),
  };
};

const normalizeInventoryHistoryMovements = (
  data: unknown,
): InventoryHistoryMovementsResponse => {
  if (!data || typeof data !== "object") {
    return { items: [], total: 0 };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? record.items
        .map(normalizeInventoryHistoryItem)
        .filter((item): item is InventoryHistoryItem => item != null)
    : [];
  const total = typeof record.total === "number" ? record.total : items.length;

  return { items, total };
};

const normalizeStockSupplyStatus = (value: unknown): StockSupplyStatus => {
  return value === "applied" ? "applied" : "pending";
};

const normalizeStockSupplyCreatedBy = (
  raw: unknown,
): StockSupplyCreatedBy | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;

  return {
    id: Number(record.id ?? 0),
    name: String(record.name ?? ""),
  };
};

const normalizeStockSupplyLine = (
  raw: unknown,
): CreateStockSupplyItem | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;

  return {
    productId: Number(record.productId ?? 0),
    productVariantId: Number(record.productVariantId ?? 0),
    quantity: Number(record.quantity ?? 0),
    buyPrice: Number(record.buyPrice ?? 0),
  };
};

const normalizeStockSupplyListItem = (
  raw: unknown,
): StockSupplyListItem | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? record.items
        .map(normalizeStockSupplyLine)
        .filter((item): item is CreateStockSupplyItem => item != null)
    : [];

  return {
    id: Number(record.id ?? 0),
    name: String(record.name ?? ""),
    status: normalizeStockSupplyStatus(record.status),
    comment: typeof record.comment === "string" ? record.comment : null,
    createdAt: String(record.createdAt ?? ""),
    appliedAt: typeof record.appliedAt === "string" ? record.appliedAt : null,
    createdBy: normalizeStockSupplyCreatedBy(record.createdBy),
    positionsCount: Number(record.positionsCount ?? items.length),
    totalQuantity: Number(record.totalQuantity ?? 0),
    totalSum: Number(record.totalSum ?? 0),
    items,
  };
};

const normalizeStockSuppliesResponse = (
  data: unknown,
  fallbackLimit = STOCK_SUPPLIES_DEFAULT_LIMIT,
  fallbackOffset = 0,
): StockSuppliesResponse => {
  if (!data || typeof data !== "object") {
    return {
      items: [],
      total: 0,
      limit: fallbackLimit,
      offset: fallbackOffset,
    };
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? record.items
        .map(normalizeStockSupplyListItem)
        .filter((item): item is StockSupplyListItem => item != null)
    : [];
  const total = typeof record.total === "number" ? record.total : items.length;
  const limit = typeof record.limit === "number" ? record.limit : fallbackLimit;
  const offset =
    typeof record.offset === "number" ? record.offset : fallbackOffset;

  return { items, total, limit, offset };
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
};
