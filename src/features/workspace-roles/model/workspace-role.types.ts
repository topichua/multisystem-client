export type WorkspacePermissionOptionValue = string | number | boolean | null;

export type WorkspaceRolePermissionOptions = Record<
  string,
  WorkspacePermissionOptionValue
>;

export type WorkspaceRolePermissionOptionLists = Record<string, string[]>;

export type WorkspaceIntegrationGrant = {
  integrationType: string;
  integrationId: number;
  read?: string;
  write?: string;
  assignResponsibility?: boolean;
  instagramCommentsView?: boolean;
  instagramCommentsWrite?: boolean;
};

export type WorkspaceProductReferenceGrantResolved = {
  integrationType: string;
  integrationId: number;
  canManage: boolean;
};

export type WorkspaceRoleResolvedPermissions = {
  isOwner: boolean;
  products: {
    view: boolean;
    createAndEdit: boolean;
    customFieldsManagement: boolean;
    categoryManagement: boolean;
    aiImport: boolean;
  };
  orders: {
    view: boolean;
    visibility: string;
    create: boolean;
    editStatus: boolean;
    edit: boolean;
  };
  conversations: {
    fullAccess: boolean;
  };
  clients: {
    viewList: boolean;
  };
  workspace: {
    chatGroupsManagement: boolean;
    templatesManagement: boolean;
    integrations: boolean;
    rolesManagement: boolean;
    members: {
      view: boolean;
      invite: boolean;
      delete: boolean;
    };
  };
  analytics: {
    view: boolean;
  };
  integrationGrants: WorkspaceIntegrationGrant[];
  productReferenceGrants: WorkspaceProductReferenceGrantResolved[];
};

export type WorkspaceRole = {
  id: number;
  workspaceId: number;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  membersCount?: number;
  permissions: string[];
  permissionOptions: WorkspaceRolePermissionOptions;
  permissionOptionLists: WorkspaceRolePermissionOptionLists;
  resolved: WorkspaceRoleResolvedPermissions;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceRolesListResponse = {
  items: WorkspaceRole[];
};

export type WorkspaceRoleCreatePayload = {
  slug: string;
  name: string;
  description?: string | null;
  color?: string | null;
  permissions: string[];
  permissionOptions?: WorkspaceRolePermissionOptions;
  permissionOptionLists?: WorkspaceRolePermissionOptionLists;
};

export type WorkspaceRoleUpdatePayload = {
  name?: string;
  description?: string | null;
  color?: string | null;
  permissions?: string[];
  permissionOptions?: WorkspaceRolePermissionOptions;
  permissionOptionLists?: WorkspaceRolePermissionOptionLists;
};

export type WorkspaceRoleIntegrationGrantPermissions = Record<
  string,
  WorkspacePermissionOptionValue
>;

export type WorkspaceRoleIntegrationGrant = {
  integrationType: string;
  integrationId: number;
  integrationName: string;
  permissions: WorkspaceRoleIntegrationGrantPermissions;
};

export type WorkspaceRoleIntegrationGrantsResponse = {
  roleId: number;
  grants: WorkspaceRoleIntegrationGrant[];
};

export type WorkspaceRoleIntegrationGrantWriteItem = {
  integrationType: string;
  integrationId: number;
  permissions: WorkspaceRoleIntegrationGrantPermissions;
};

export type WorkspaceRoleIntegrationGrantsUpdatePayload = {
  grants: WorkspaceRoleIntegrationGrantWriteItem[];
};

export type WorkspaceRoleProductReferenceGrant = {
  integrationType: string;
  integrationId: number;
  integrationName: string;
  canManage: boolean;
};

export type WorkspaceRoleProductReferenceGrantsResponse = {
  roleId: number;
  grants: WorkspaceRoleProductReferenceGrant[];
};

export type WorkspaceRoleProductReferenceGrantWriteItem = {
  integrationType: string;
  integrationId: number;
  canManage: boolean;
};

export type WorkspaceRoleProductReferenceGrantsUpdatePayload = {
  grants: WorkspaceRoleProductReferenceGrantWriteItem[];
};

export type WorkspacePermissionsCatalogStorageKey =
  | "permissions"
  | "permissionOptions"
  | "permissionOptionLists"
  | "integrationGrants"
  | "productReferenceGrants";

export type WorkspacePermissionsCatalogStorageHint = {
  type: string;
  description: string;
  endpoint?: string;
};

export type WorkspacePermissionsCatalogOption = {
  value: string;
  label: string;
};

export type WorkspacePermissionsCatalogItem = {
  type:
    | "boolean"
    | "option"
    | "group"
    | "integration_grants"
    | "product_reference_grants"
    | (string & {});
  key: string;
  label?: string;
  description?: string;
  storage?: WorkspacePermissionsCatalogStorageKey;
  default?: WorkspacePermissionOptionValue | string[] | boolean;
  options?: WorkspacePermissionsCatalogOption[];
  scope?: WorkspacePermissionsCatalogItem;
  items?: WorkspacePermissionsCatalogItem[];
  integrationTypes?: string[];
  manageEndpoint?: string;
  requires?: string[];
};

export type WorkspacePermissionsCatalogModule = {
  module: string;
  label: string;
  items: WorkspacePermissionsCatalogItem[];
};

export type WorkspacePermissionsCatalogSchema = {
  version: number;
  storage: Record<string, WorkspacePermissionsCatalogStorageHint>;
  modules: WorkspacePermissionsCatalogModule[];
};

export type WorkspacePermissionsCatalogResponse = {
  schema: WorkspacePermissionsCatalogSchema;
};
