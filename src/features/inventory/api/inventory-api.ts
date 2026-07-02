import { apiClient } from "@/api/api-client";

import {
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
};
