export const INVENTORY_MOVEMENTS_DEFAULT_LIMIT = 20;

export type InventoryMovementType =
  | "initial_stock"
  | "purchase"
  | "order_sale"
  | "order_cancel"
  | "return"
  | "correction"
  | "inventory"
  | "simple_adjustment"
  | "simple_order_sale"
  | "simple_order_cancel";

export type InventoryMovementUser = {
  id: number;
  name?: string | null;
};

export type InventoryMovement = {
  id: number;
  type: InventoryMovementType;
  reason: string | null;
  quantityChange: number;
  purchasePrice: number | null;
  totalCostChange: number | null;
  comment: string | null;
  orderId: number | null;
  orderItemId: number | null;
  user: InventoryMovementUser | null;
  createdAt: string;
};

export type InventoryMovementsResponse = {
  items: InventoryMovement[];
  total: number;
};

export type InventoryVariantMovementsQuery = {
  variantId: number;
  limit?: number;
};
