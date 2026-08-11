export type AuthUserRole = "super_admin" | string;

export type MemberWorkStatus =
  | "accepting_new_chats"
  | "not_accepting_new_chats"
  | "break";

export type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  avatar_src: string | null;
  phone?: string | null;
  status: number;
  invitedAt: string | null;
  invitedByUserId: number | null;
  invitationExpiresAt: string | null;
  invitationAcceptedAt: string | null;
  emailVerifiedAt: string | null;
  lastSeenAt: string | null;
  lastLoginAt: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  postalCode: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AuthCompany = {
  id: number;
  name: string;
  pageId: string;
  instagramAccountId: string;
  workspaceId?: number | null;
};

export type AuthPlanEntitlements = {
  socialAccountsLimit: number;
  privateAccountsLimit: number;
  wishlistEnabled: boolean;
  advancedInventoryEnabled: boolean;
  advancedAnalyticsEnabled: boolean;
  aiCreditsMonthly: number;
};

export type AuthPlan = {
  id: number;
  slug: string;
  name: string;
  isPublic: boolean;
  entitlements: AuthPlanEntitlements;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  sortOrder: number;
};

export type AuthEntitlementsUsage = {
  socialAccounts: number;
  privateAccounts: number;
  aiCreditsUsed: number;
};

export type AuthEntitlements = {
  socialAccountsLimit: number;
  privateAccountsLimit: number;
  wishlistEnabled: boolean;
  advancedInventoryEnabled: boolean;
  advancedAnalyticsEnabled: boolean;
  aiCreditsMonthly: number;
  aiCreditsUsed: number;
  aiCreditsPurchased: number;
  creditsResetAt: string | null;
  usage: AuthEntitlementsUsage;
};

export type AuthSubscription = {
  periodEnd: string | null;
  periodStart: string | null;
  status: string;
  billingCycle: "monthly" | "yearly" | string;
  isExpired: boolean;
  canRenew: boolean;
};

export type AuthProductsPermissions = {
  enabled: boolean;
  view: boolean;
  createAndEdit: boolean;
  customFieldsManagement: boolean;
  categoryManagement: boolean;
  aiImport: boolean;
  inventoryView: boolean;
  inventoryManage: boolean;
  referencesManagement: boolean;
  export: boolean;
};

export type AuthOrdersPermissions = {
  view: boolean;
  visibility: "none" | string;
  create: boolean;
  editStatus: boolean;
  edit: boolean;
  paymentsManage: boolean;
};

export type AuthConversationsPermissions = {
  fullAccess: boolean;
};

export type AuthClientsPermissions = {
  viewList: boolean;
};

export type AuthWorkspaceMembersPermissions = {
  view: boolean;
  invite: boolean;
  delete: boolean;
};

export type AuthWorkspacePermissions = {
  chatGroupsManagement: boolean;
  templatesManagement: boolean;
  orderStatusesManagement: boolean;
  integrations: boolean;
  rolesManagement: boolean;
  members: AuthWorkspaceMembersPermissions;
  settingsManagement: boolean;
};

export type AuthAnalyticsPermissions = {
  view: boolean;
};

export type AuthIntegrationGrant = {
  integrationType: string;
  integrationId: number;
  read: string;
  write: string;
  assignResponsibility: boolean;
  canTakeChat: boolean;
  instagramCommentsView: boolean;
  instagramCommentsWrite: boolean;
};

export type AuthProductReferenceGrant = {
  integrationType: string;
  integrationId: number;
  canManage: boolean;
};

export type AuthPermissions = {
  isOwner: boolean;
  products: AuthProductsPermissions;
  orders: AuthOrdersPermissions;
  conversations: AuthConversationsPermissions;
  clients: AuthClientsPermissions;
  workspace: AuthWorkspacePermissions;
  analytics: AuthAnalyticsPermissions;
  integrationGrants: AuthIntegrationGrant[];
  productReferenceGrants: AuthProductReferenceGrant[];
};

export type AuthWorkspaceRole = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  isOwner: boolean;
  memberId: number;
};

export type AuthSessionResponse = {
  email: string;
  role: AuthUserRole;
  user: AuthUser;
  company: AuthCompany | null;
  companyName: string | null;
  plan?: AuthPlan | null;
  entitlements?: AuthEntitlements | null;
  subscription?: AuthSubscription | null;
  permissions?: AuthPermissions | null;
  workspaceRole?: AuthWorkspaceRole | null;
  work_status?: MemberWorkStatus | null;
};
