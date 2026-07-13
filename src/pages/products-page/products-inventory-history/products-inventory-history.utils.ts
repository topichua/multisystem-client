import type { TFunction } from "i18next";
import dayjs from "dayjs";

import type {
  InventoryHistoryItem,
  InventoryHistoryMovementType,
  InventoryHistorySupplyItem,
} from "@/features/inventory/model/inventory.types";
import { formatMoney } from "@/features/orders/utils/format-money";

export type InventoryHistoryBadgeTone = "success" | "error" | "neutral";

export const INVENTORY_HISTORY_BADGE_LABEL_TYPES = new Set<InventoryHistoryMovementType>([
  "supply",
  "purchase",
  "initial_stock",
  "return",
  "order_sale",
  "simple_order_sale",
  "order_cancel",
  "simple_order_cancel",
  "order_reserve",
  "order_release",
  "correction",
  "inventory",
]);

export function isInventoryHistorySupplyItem(
  item: InventoryHistoryItem,
): item is InventoryHistorySupplyItem {
  return item.kind === "supply";
}

export function getInventoryHistoryMovementNote(
  item: InventoryHistoryItem,
): string | null {
  if (item.kind !== "movement") {
    return null;
  }

  return (
    [item.reason?.trim(), item.comment?.trim()].filter(Boolean).join(" — ") ||
    null
  );
}

export function getInventoryHistoryQuantityChange(
  item: InventoryHistoryItem,
): number {
  return isInventoryHistorySupplyItem(item)
    ? item.totalQuantityChange
    : item.quantityChange;
}

export function getInventoryHistoryItemDetails(
  item: InventoryHistoryItem,
  t: TFunction,
): { title: string; subtitle: string; isSupply: boolean } {
  const isSupply = isInventoryHistorySupplyItem(item);

  return {
    isSupply,
    title: isSupply
      ? t("products.inventoryHistory.supplyGroupTitle", {
          count: item.itemsCount,
        })
      : item.productName,
    subtitle: isSupply
      ? getInventoryHistorySupplyPreview(item, t)
      : formatInventoryHistoryVariantLabel(item.variantName, item.sku),
  };
}

export function getInventoryHistoryStockLabel(
  item: InventoryHistoryItem,
  t: TFunction,
  formatStockNumber: (value: number) => string,
): string {
  if (isInventoryHistorySupplyItem(item)) {
    return t("products.inventoryHistory.positionsCount", {
      count: item.itemsCount,
    });
  }

  return `${formatStockNumber(item.stockBefore)} → ${formatStockNumber(item.stockAfter)}`;
}

export function getInventoryHistoryItemKey(item: InventoryHistoryItem): string {
  return `${item.kind}-${item.id}`;
}

export function formatInventoryHistoryDate(value: string): string {
  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format("DD.MM.YYYY") : "";
}

export function formatInventoryHistoryTime(value: string): string {
  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format("HH:mm") : "";
}

export function formatInventoryHistoryVariantLabel(
  variantName: string,
  sku: string | null,
): string {
  if (sku?.trim()) {
    return `${variantName} · ${sku}`;
  }

  return variantName;
}

export function getInventoryHistoryBadgeLabel(
  type: InventoryHistoryMovementType | string,
  t: TFunction,
): string {
  const fallback = t("products.inventoryHistory.badges.fallback");

  if (
    typeof type !== "string" ||
    !type ||
    !INVENTORY_HISTORY_BADGE_LABEL_TYPES.has(
      type as InventoryHistoryMovementType,
    )
  ) {
    return fallback;
  }

  const key = `products.inventoryHistory.badges.${type}`;
  const label = t(key, { defaultValue: fallback });

  if (!label || label === key || label === type) {
    return fallback;
  }

  return label;
}

export function getInventoryHistoryBadgeTone(
  type: InventoryHistoryMovementType,
): InventoryHistoryBadgeTone {
  switch (type) {
    case "supply":
    case "purchase":
    case "return":
    case "initial_stock":
    case "order_cancel":
    case "simple_order_cancel":
      return "success";

    case "correction":
    case "order_sale":
    case "simple_order_sale":
      return "error";

    default:
      return "neutral";
  }
}

export function getInventoryHistoryPriceLabel(
  item: InventoryHistoryItem,
  currency: string,
  t: TFunction,
): string {
  const formatUnitPrice = (value: number | null) => {
    if (value == null) {
      return "—";
    }

    return t("products.inventoryHistory.pricePerUnit", {
      price: formatMoney(value, currency, "—"),
    });
  };

  if (isInventoryHistorySupplyItem(item)) {
    const prices = new Set(
      item.items
        .map((line) => line.purchasePrice)
        .filter((price): price is number => price != null),
    );

    if (prices.size > 1) {
      return t("products.inventoryHistory.variousPrices");
    }

    const [singlePrice] = prices;
    return formatUnitPrice(singlePrice ?? null);
  }

  return formatUnitPrice(item.purchasePrice);
}

export function getInventoryHistorySupplyPreview(
  item: InventoryHistorySupplyItem,
  t: TFunction,
): string {
  if (item.previewText?.trim()) {
    return item.previewText;
  }

  const [firstLine] = item.items;
  if (!firstLine) {
    return "";
  }

  const remaining = Math.max(0, item.itemsCount - 1);
  if (remaining === 0) {
    return `${firstLine.productName}, ${formatInventoryHistoryVariantLabel(
      firstLine.variantName,
      firstLine.sku,
    )}`;
  }

  return t("products.inventoryHistory.supplyPreview", {
    product: firstLine.productName,
    variant: firstLine.variantName,
    count: remaining,
  });
}
