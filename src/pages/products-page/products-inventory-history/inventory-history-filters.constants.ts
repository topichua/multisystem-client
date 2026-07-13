import {
  INVENTORY_HISTORY_MOVEMENT_TYPES,
  type InventoryHistoryMovementType,
} from "@/features/inventory/model/inventory.types";

export type InventoryHistoryPanelFilters = {
  type?: InventoryHistoryMovementType;
  from?: string;
  to?: string;
  userId?: number;
};

export const EMPTY_INVENTORY_HISTORY_PANEL_FILTERS: InventoryHistoryPanelFilters =
  {};

export const INVENTORY_HISTORY_FILTER_TYPE_OPTIONS: Array<{
  value: InventoryHistoryMovementType | null;
  badgeKey?: InventoryHistoryMovementType;
}> = [
  { value: null },
  ...INVENTORY_HISTORY_MOVEMENT_TYPES.map((type) => ({
    value: type,
    badgeKey: type,
  })),
];

export function countInventoryHistoryPanelFilters(
  filters: InventoryHistoryPanelFilters,
): number {
  let count = 0;

  if (filters.type) {
    count += 1;
  }

  if (filters.from) {
    count += 1;
  }

  if (filters.to) {
    count += 1;
  }

  if (filters.userId != null) {
    count += 1;
  }

  return count;
}
