export const WORKSPACE_CURRENCIES = ["UAH", "USD"] as const;

export type WorkspaceCurrency = (typeof WORKSPACE_CURRENCIES)[number];

export type WorkspaceSettings = {
  workspaceId: number;
  currency: WorkspaceCurrency;
};

export type WorkspaceSettingsUpdatePayload = {
  currency: WorkspaceCurrency;
};
