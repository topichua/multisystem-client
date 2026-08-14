export const WORKSPACE_CURRENCIES = ["UAH", "USD"] as const;

export type WorkspaceCurrency = (typeof WORKSPACE_CURRENCIES)[number];

export const WORKSPACE_LANGUAGES = ["ua", "en"] as const;

export type WorkspaceLanguage = (typeof WORKSPACE_LANGUAGES)[number];

export const WORK_WEEKDAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type WorkWeekday = (typeof WORK_WEEKDAYS)[number];

export const InventoryMode = {
  simple: "simple",
  advanced: "advanced",
} as const;

export type InventoryMode = (typeof InventoryMode)[keyof typeof InventoryMode];

export const INVENTORY_MODE_VALUES = Object.values(InventoryMode);

export type WorkDayHours = {
  start: string;
  end: string;
};

export type WorkspaceWorkSchedule = {
  dayStart: string;
  dayEnd: string;
  workDays: WorkWeekday[];
  differentHoursPerDay: boolean;
  dayHours: Partial<Record<WorkWeekday, WorkDayHours>>;
};

export type WorkspaceSettings = {
  workspaceId: number;
  currency: WorkspaceCurrency;
  inventoryMode: InventoryMode;
  language: WorkspaceLanguage;
  wishlistEnabled: boolean;
  timezone: string;
  workSchedule: WorkspaceWorkSchedule;
};

export type WorkspaceSettingsUpdatePayload = {
  currency: WorkspaceCurrency;
  inventoryMode?: InventoryMode;
  language?: WorkspaceLanguage;
  wishlistEnabled?: boolean;
  timezone?: string;
  workSchedule?: WorkspaceWorkSchedule;
};
