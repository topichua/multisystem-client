import type { TFunction } from "i18next";

import type {
  InventoryHistorySupplyItem,
  StockSupplyListBy,
  StockSupplyListItem,
  StockSupplyStatus,
} from "@/features/inventory/model/inventory.types";
import { formatDateTimeNumeric } from "@/utils/date-time";

const SUPPLY_STATUS_LABEL_KEYS = {
  applied: "products.supplies.status.applied",
  pending: "products.supplies.status.pending",
} as const;

const SUPPLIES_TAB_LABEL_KEYS = {
  all: "products.supplies.tabs.all",
  not_applied: "products.supplies.tabs.notApplied",
  applied: "products.supplies.tabs.applied",
} as const;

export const getSupplyStatusLabel = (
  status: StockSupplyStatus,
  t: TFunction,
): string => t(SUPPLY_STATUS_LABEL_KEYS[status]);

export const getSupplyStatusTagColor = (
  status: StockSupplyStatus,
): "success" | "default" => (status === "applied" ? "success" : "default");

export const getSuppliesStatusTabLabel = (
  by: StockSupplyListBy,
  t: TFunction,
): string => t(SUPPLIES_TAB_LABEL_KEYS[by]);

export const formatSupplyDateTime = (
  value: string | null | undefined,
): string => (value ? formatDateTimeNumeric(value) : "") || "—";

export const toInventoryHistorySupplyItem = (
  supply: StockSupplyListItem,
): InventoryHistorySupplyItem => ({
  kind: "supply",
  id: supply.id,
  type: "supply",
  name: supply.name,
  createdAt: supply.createdAt,
  comment: supply.comment,
  user: supply.createdBy,
  itemsCount: supply.positionsCount,
  totalQuantityChange: supply.totalQuantity,
  totalPurchaseCost: supply.totalSum,
  items: supply.items.map((line) => ({
    productId: line.productId,
    productName: line.productName?.trim() || `#${line.productId}`,
    variantId: line.productVariantId,
    variantName: line.variantName?.trim() || `#${line.productVariantId}`,
    sku: line.sku ?? null,
    quantityChange: line.quantity,
    purchasePrice: line.buyPrice,
    stockBefore: 0,
    stockAfter: 0,
  })),
});
