import type {
  WorkspacePermissionOptionValue,
  WorkspacePermissionsCatalogItem,
  WorkspacePermissionsCatalogSchema,
  WorkspaceRole,
  WorkspaceRoleIntegrationGrant,
  WorkspaceRoleIntegrationGrantsUpdatePayload,
  WorkspaceRoleIntegrationGrantWriteItem,
  WorkspaceRolePermissionOptionLists,
  WorkspaceRolePermissionOptions,
  WorkspaceRoleProductReferenceGrant,
  WorkspaceRoleProductReferenceGrantsUpdatePayload,
  WorkspaceRoleUpdatePayload,
} from "@/features/workspace-roles/model/workspace-role.types";

export type WorkspaceRoleIntegrationGrantFormValue = {
  integrationType: string;
  integrationId: number;
  permissions: WorkspaceRolePermissionOptions;
};

export type WorkspaceRoleProductReferenceGrantFormValue = {
  integrationType: string;
  integrationId: number;
  canManage: boolean;
};

export type WorkspaceRoleFormValues = {
  name: string;
  description?: string | null;
  color?: string | null;
  permissions?: Record<string, boolean>;
  permissionOptions?: WorkspaceRolePermissionOptions;
  permissionOptionLists?: WorkspaceRolePermissionOptionLists;
  integrationGrants?: Record<string, WorkspaceRoleIntegrationGrantFormValue>;
  productReferenceGrants?: Record<
    string,
    WorkspaceRoleProductReferenceGrantFormValue
  >;
};

type CatalogFieldMeta = {
  permissionKeys: Set<string>;
  optionKeys: Set<string>;
  optionListKeys: Set<string>;
  optionDefaults: Map<string, WorkspacePermissionOptionValue>;
  optionListDefaults: Map<string, string[]>;
};

const isPermissionOptionValue = (
  value: unknown,
): value is WorkspacePermissionOptionValue =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  value === null;

const toNullableTrimmedString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
};

const visitCatalogItem = (
  item: WorkspacePermissionsCatalogItem,
  visit: (item: WorkspacePermissionsCatalogItem) => void,
): void => {
  visit(item);

  if (item.scope) {
    visitCatalogItem(item.scope, visit);
  }

  item.items?.forEach((child) => visitCatalogItem(child, visit));
};

const getCatalogFieldMeta = (
  schema: WorkspacePermissionsCatalogSchema,
): CatalogFieldMeta => {
  const meta: CatalogFieldMeta = {
    permissionKeys: new Set<string>(),
    optionKeys: new Set<string>(),
    optionListKeys: new Set<string>(),
    optionDefaults: new Map<string, WorkspacePermissionOptionValue>(),
    optionListDefaults: new Map<string, string[]>(),
  };

  schema.modules.forEach((module) => {
    module.items.forEach((item) => {
      visitCatalogItem(item, (visited) => {
        if (visited.storage === "permissions" && visited.type === "boolean") {
          meta.permissionKeys.add(visited.key);
          return;
        }

        if (
          visited.storage === "permissionOptions" &&
          visited.type === "option"
        ) {
          meta.optionKeys.add(visited.key);

          if (isPermissionOptionValue(visited.default)) {
            meta.optionDefaults.set(visited.key, visited.default);
          }
          return;
        }

        if (visited.storage === "permissionOptionLists") {
          meta.optionListKeys.add(visited.key);

          if (
            Array.isArray(visited.default) &&
            visited.default.every((value) => typeof value === "string")
          ) {
            meta.optionListDefaults.set(visited.key, visited.default);
          }
        }
      });
    });
  });

  return meta;
};

const getIntegrationGrantCatalogItems = (
  schema: WorkspacePermissionsCatalogSchema,
): WorkspacePermissionsCatalogItem[] =>
  schema.modules.flatMap((module) =>
    module.items.flatMap((item) =>
      item.type === "integration_grants" ? (item.items ?? []) : [],
    ),
  );

const isGrantCatalogItemVisibleForType = (
  item: WorkspacePermissionsCatalogItem,
  integrationType: string,
): boolean =>
  !item.integrationTypes || item.integrationTypes.includes(integrationType);

const hasCatalogItemType = (
  schema: WorkspacePermissionsCatalogSchema,
  type: string,
): boolean =>
  schema.modules.some((module) =>
    module.items.some((item) => item.type === type),
  );

export const hasIntegrationGrantCatalogItem = (
  schema: WorkspacePermissionsCatalogSchema,
): boolean => hasCatalogItemType(schema, "integration_grants");

export const hasProductReferenceGrantCatalogItem = (
  schema: WorkspacePermissionsCatalogSchema,
): boolean => hasCatalogItemType(schema, "product_reference_grants");

export const getIntegrationGrantFormKey = (
  grant:
    | Pick<WorkspaceRoleIntegrationGrant, "integrationType" | "integrationId">
    | Pick<
        WorkspaceRoleIntegrationGrantWriteItem,
        "integrationType" | "integrationId"
      >
    | Pick<
        WorkspaceRoleProductReferenceGrant,
        "integrationType" | "integrationId"
      >,
): string => `${grant.integrationType}:${grant.integrationId}`;

const getIntegrationGrantDefaults = (
  schema: WorkspacePermissionsCatalogSchema,
  integrationType: string,
): WorkspaceRolePermissionOptions => {
  const defaults: WorkspaceRolePermissionOptions = {};

  getIntegrationGrantCatalogItems(schema).forEach((item) => {
    if (
      isGrantCatalogItemVisibleForType(item, integrationType) &&
      isPermissionOptionValue(item.default)
    ) {
      defaults[item.key] = item.default;
    }
  });

  return defaults;
};

export const toWorkspaceRoleFormValues = (
  role: WorkspaceRole,
  schema: WorkspacePermissionsCatalogSchema,
  integrationGrants: WorkspaceRoleIntegrationGrant[] = [],
  productReferenceGrants: WorkspaceRoleProductReferenceGrant[] = [],
): WorkspaceRoleFormValues => {
  const meta = getCatalogFieldMeta(schema);
  const permissions: Record<string, boolean> = {};
  const permissionOptions: WorkspaceRolePermissionOptions = {
    ...role.permissionOptions,
  };
  const permissionOptionLists: WorkspaceRolePermissionOptionLists = {
    ...role.permissionOptionLists,
  };

  meta.permissionKeys.forEach((key) => {
    permissions[key] = role.permissions.includes(key);
  });

  meta.optionDefaults.forEach((value, key) => {
    if (permissionOptions[key] === undefined) {
      permissionOptions[key] = value;
    }
  });

  meta.optionListDefaults.forEach((value, key) => {
    if (permissionOptionLists[key] === undefined) {
      permissionOptionLists[key] = value;
    }
  });

  const integrationGrantValues = Object.fromEntries(
    integrationGrants.map((grant) => [
      getIntegrationGrantFormKey(grant),
      {
        integrationType: grant.integrationType,
        integrationId: grant.integrationId,
        permissions: {
          ...getIntegrationGrantDefaults(schema, grant.integrationType),
          ...grant.permissions,
        },
      },
    ]),
  );

  const productReferenceGrantValues = Object.fromEntries(
    productReferenceGrants.map((grant) => [
      getIntegrationGrantFormKey(grant),
      {
        integrationType: grant.integrationType,
        integrationId: grant.integrationId,
        canManage: grant.canManage === true,
      },
    ]),
  );

  return {
    name: role.name,
    description: role.description ?? "",
    color: role.color,
    permissions,
    permissionOptions,
    permissionOptionLists,
    integrationGrants: integrationGrantValues,
    productReferenceGrants: productReferenceGrantValues,
  };
};

export const buildWorkspaceRoleUpdatePayload = (
  role: WorkspaceRole,
  schema: WorkspacePermissionsCatalogSchema,
  values: WorkspaceRoleFormValues,
): WorkspaceRoleUpdatePayload => {
  const meta = getCatalogFieldMeta(schema);
  const formPermissions = values.permissions ?? {};
  const knownPermissions = Array.from(meta.permissionKeys).filter(
    (key) => formPermissions[key] === true,
  );
  const hiddenExistingPermissions = role.permissions.filter(
    (key) => !meta.permissionKeys.has(key),
  );
  const permissionOptions: WorkspaceRolePermissionOptions = {
    ...role.permissionOptions,
  };
  const permissionOptionLists: WorkspaceRolePermissionOptionLists = {
    ...role.permissionOptionLists,
  };

  meta.optionKeys.forEach((key) => {
    const value = values.permissionOptions?.[key];

    if (value !== undefined) {
      permissionOptions[key] = value;
      return;
    }

    const defaultValue = meta.optionDefaults.get(key);
    if (defaultValue !== undefined) {
      permissionOptions[key] = defaultValue;
    } else {
      delete permissionOptions[key];
    }
  });

  meta.optionListKeys.forEach((key) => {
    const value = values.permissionOptionLists?.[key];

    if (Array.isArray(value)) {
      permissionOptionLists[key] = value;
      return;
    }

    const defaultValue = meta.optionListDefaults.get(key);
    if (defaultValue !== undefined) {
      permissionOptionLists[key] = defaultValue;
    }
  });

  return {
    name: values.name.trim(),
    description: toNullableTrimmedString(values.description),
    color: toNullableTrimmedString(values.color),
    permissions: Array.from(
      new Set([...knownPermissions, ...hiddenExistingPermissions]),
    ),
    permissionOptions,
    permissionOptionLists,
  };
};

export const buildWorkspaceRoleIntegrationGrantsPayload = (
  schema: WorkspacePermissionsCatalogSchema,
  currentGrants: WorkspaceRoleIntegrationGrant[],
  values: WorkspaceRoleFormValues,
): WorkspaceRoleIntegrationGrantsUpdatePayload => {
  const catalogItems = getIntegrationGrantCatalogItems(schema);
  const grants = currentGrants.map((grant) => {
    const key = getIntegrationGrantFormKey(grant);
    const formGrant = values.integrationGrants?.[key];
    const permissions: WorkspaceRolePermissionOptions = {
      ...grant.permissions,
    };

    catalogItems.forEach((item) => {
      if (!isGrantCatalogItemVisibleForType(item, grant.integrationType)) {
        return;
      }

      const formValue = formGrant?.permissions?.[item.key];

      if (formValue !== undefined) {
        permissions[item.key] = formValue;
        return;
      }

      if (isPermissionOptionValue(item.default)) {
        permissions[item.key] = item.default;
      }
    });

    return {
      integrationType: grant.integrationType,
      integrationId: grant.integrationId,
      permissions,
    };
  });

  return { grants };
};

export const buildWorkspaceRoleProductReferenceGrantsPayload = (
  currentGrants: WorkspaceRoleProductReferenceGrant[],
  values: WorkspaceRoleFormValues,
): WorkspaceRoleProductReferenceGrantsUpdatePayload => ({
  grants: currentGrants.map((grant) => {
    const key = getIntegrationGrantFormKey(grant);
    const formGrant = values.productReferenceGrants?.[key];

    return {
      integrationType: grant.integrationType,
      integrationId: grant.integrationId,
      canManage: formGrant?.canManage === true,
    };
  }),
});
