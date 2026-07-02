export const WORKSPACE_CURRENCIES = ["UAH", "USD"] as const;

export type WorkspaceCurrency = (typeof WORKSPACE_CURRENCIES)[number];

export const InventoryMode = {
  simple: "simple",
  advanced: "advanced",
} as const;

export type InventoryMode = (typeof InventoryMode)[keyof typeof InventoryMode];

export const INVENTORY_MODE_VALUES = Object.values(InventoryMode);

export type WorkspaceSettings = {
  workspaceId: number;
  currency: WorkspaceCurrency;
  inventoryMode: InventoryMode;
};

export type WorkspaceSettingsUpdatePayload = {
  currency: WorkspaceCurrency;
  inventoryMode?: InventoryMode;
};
