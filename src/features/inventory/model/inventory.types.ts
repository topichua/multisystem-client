export const INVENTORY_MOVEMENTS_DEFAULT_LIMIT = 20;
export const INVENTORY_MOVEMENTS_PREVIEW_LIMIT = 3;

export type InventoryMovementType =
  | "initial_stock"
  | "purchase"
  | "order_sale"
  | "order_cancel"
  | "return"
  | "correction"
  | "inventory"
  | "supply"
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
  supplyId?: number | null;
  user: InventoryMovementUser | null;
  createdAt: string;
};

export type InventoryStock = {
  variantId: number;
  quantity: number;
  avgPurchasePrice: number | null;
  totalCost: number;
  stockInitialized: boolean;
  requiresInitialization: boolean;
};

export type InventoryMovementsResponse = {
  items: InventoryMovement[];
  total: number;
};

export type InventoryVariantMovementsQuery = {
  variantId: number;
  limit?: number;
};

export type CreateInitialStockRequest = {
  variantId: number;
  quantity: number;
  purchasePrice: number;
  comment: string;
};

export type InitialStockValues = Omit<CreateInitialStockRequest, "variantId">;

export type CreateStockMovementResponse = {
  movement: InventoryMovement;
  stock: InventoryStock;
};

export type CreateInitialStockResponse = CreateStockMovementResponse;

export type CreateStockPurchaseRequest = {
  variantId: number;
  quantity: number;
  purchasePrice: number;
  comment: string;
};

export type StockPurchaseValues = Omit<CreateStockPurchaseRequest, "variantId">;

export type CreateStockPurchaseResponse = CreateStockMovementResponse;

export type CreateStockCorrectionRequest = {
  variantId: number;
  quantityChange: number;
  reason: string;
  comment: string;
};

export type StockCorrectionValues = Omit<
  CreateStockCorrectionRequest,
  "variantId"
>;

export type CreateStockCorrectionResponse = CreateStockMovementResponse;

export type CreateStockSupplyItem = {
  productId: number;
  productVariantId: number;
  quantity: number;
  buyPrice: number;
};

export type CreateStockSupplyRequest = {
  items: CreateStockSupplyItem[];
  comment: string;
};

export type StockSupply = {
  id: number;
  comment: string | null;
  createdAt: string;
  items: CreateStockSupplyItem[];
};

export type CreateStockSupplyLine = {
  item: CreateStockSupplyItem;
  movement: InventoryMovement;
  stock: InventoryStock;
};

export type CreateStockSupplyResponse = {
  supply: StockSupply;
  lines: CreateStockSupplyLine[];
};

export const INVENTORY_HISTORY_MOVEMENTS_ENDPOINT =
  '/inventory/history-movements';

export const INVENTORY_HISTORY_MOVEMENTS_DEFAULT_LIMIT = 20;

export type InventoryHistoryMovementType =
  | 'initial_stock'
  | 'purchase'
  | 'order_sale'
  | 'order_cancel'
  | 'return'
  | 'correction'
  | 'inventory'
  | 'simple_adjustment'
  | 'simple_order_sale'
  | 'simple_order_cancel'
  | 'supply'
  | 'order_reserve'
  | 'order_release';

export const INVENTORY_HISTORY_MOVEMENT_TYPES = [
  'supply',
  'purchase',
  'initial_stock',
  'return',
  'order_sale',
  'simple_order_sale',
  'order_cancel',
  'simple_order_cancel',
  'order_reserve',
  'order_release',
  'correction',
  'inventory',
  'simple_adjustment',
] as const satisfies readonly InventoryHistoryMovementType[];

export type GetInventoryHistoryMovementsParams = {
  from?: string;
  to?: string;
  userId?: number;
  type?: InventoryHistoryMovementType;
  keyword?: string;
  limit?: number;
  offset?: number;
};

export type InventoryHistoryItemKind = 'movement' | 'supply';

export type InventoryHistoryMovement = {
  kind: 'movement';
  id: number;
  type: InventoryHistoryMovementType;
  createdAt: string;
  reason: string | null;
  comment: string | null;
  user: InventoryMovementUser | null;
  productId: number;
  productName: string;
  variantId: number;
  variantName: string;
  sku: string | null;
  quantityChange: number;
  purchasePrice: number | null;
  totalCostChange: number | null;
  stockBefore: number;
  stockAfter: number;
};

export type InventoryHistorySupplyLine = {
  productId: number;
  productName: string;
  variantId: number;
  variantName: string;
  sku: string | null;
  quantityChange: number;
  purchasePrice: number | null;
  stockBefore: number;
  stockAfter: number;
};

export type InventoryHistorySupplyItem = {
  kind: 'supply';
  id: number;
  type: 'supply';
  createdAt: string;
  comment: string | null;
  user: InventoryMovementUser | null;
  itemsCount: number;
  totalQuantityChange: number;
  totalPurchaseCost: number | null;
  previewText?: string | null;
  items: InventoryHistorySupplyLine[];
};

export type InventoryHistoryItem =
  | InventoryHistoryMovement
  | InventoryHistorySupplyItem;

export type InventoryHistoryMovementsResponse = {
  items: InventoryHistoryItem[];
  total: number;
};
