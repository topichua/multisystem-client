import type { TFunction } from "i18next";

import type {
  StockSupplyListBy,
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
