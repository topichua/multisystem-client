import type { TFunction } from "i18next";

import type { InventoryMovement } from "@/features/inventory/model/inventory.types";

import { formatNumber } from "../product-inventory-drawer.utils";

export type MovementWithQuantityTransition = {
  movement: InventoryMovement;
  quantityBefore: number;
  quantityAfter: number;
};

const PLACEHOLDER_MOVEMENT_TYPES = new Set<InventoryMovement["type"]>([
  "simple_adjustment",
]);

export function isPlaceholderInventoryMovement(
  movement: InventoryMovement,
): boolean {
  return PLACEHOLDER_MOVEMENT_TYPES.has(movement.type);
}

export function getDisplayableInventoryMovements(
  movements: InventoryMovement[],
): InventoryMovement[] {
  return movements.filter(
    (movement) => !isPlaceholderInventoryMovement(movement),
  );
}

export function getDisplayableInventoryMovementsTotal(
  movements: InventoryMovement[],
  total?: number | null,
): number {
  const placeholderCount = movements.filter(isPlaceholderInventoryMovement).length;

  if (total == null) {
    return getDisplayableInventoryMovements(movements).length;
  }

  return Math.max(0, total - placeholderCount);
}

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
