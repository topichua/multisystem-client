import type { StockSupplyListBy } from "@/features/inventory/model/inventory.types";

export type SuppliesPanelFilters = {
  createdBy?: number;
  createdFrom?: string;
  createdTo?: string;
  totalSumFrom?: number;
  totalSumTo?: number;
};

export type SuppliesStatusCounts = Record<StockSupplyListBy, number>;

export const EMPTY_SUPPLIES_PANEL_FILTERS: SuppliesPanelFilters = {};

export const EMPTY_SUPPLIES_STATUS_COUNTS: SuppliesStatusCounts = {
  all: 0,
  applied: 0,
  not_applied: 0,
};

export const SUPPLIES_STATUS_TABS: StockSupplyListBy[] = [
  "all",
  "not_applied",
  "applied",
];

export const countSuppliesPanelFilters = (
  filters: SuppliesPanelFilters,
): number =>
  [
    filters.createdBy != null,
    Boolean(filters.createdFrom),
    Boolean(filters.createdTo),
    filters.totalSumFrom != null,
    filters.totalSumTo != null,
  ].filter(Boolean).length;
