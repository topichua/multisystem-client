import type { TFunction } from "i18next";

import type { InventoryMovement } from "@/features/inventory/model/inventory.types";

import { formatNumber } from "../product-inventory-drawer.utils";

export type MovementWithQuantityTransition = {
  movement: InventoryMovement;
  quantityBefore: number;
  quantityAfter: number;
};

export function getMovementTitle(type: string, t: TFunction): string {
  const key = `products.inventoryDrawer.movementTypes.${type}`;
  const translated = t(key);

  return translated === key
    ? t("products.inventoryDrawer.movementTypes.fallback")
    : translated;
}

export function formatQuantityChange(value: number): string {
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

export function buildMovementTransitions(
  movements: InventoryMovement[],
  currentQuantity: number,
): MovementWithQuantityTransition[] {
  let nextQuantity = currentQuantity;

  return [...movements]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((movement) => {
      const quantityChange = Number(movement.quantityChange ?? 0);
      const quantityAfter = nextQuantity;
      const quantityBefore = quantityAfter - quantityChange;
      nextQuantity = quantityBefore;

      return {
        movement,
        quantityBefore,
        quantityAfter,
      };
    });
}
