import type { FormInstance } from "antd";
import type { TFunction } from "i18next";

import type {
  WorkspacePermissionsCatalogItem,
  WorkspacePermissionsCatalogModule,
  WorkspacePermissionsCatalogOption,
} from "@/features/workspace-roles/model/workspace-role.types";
import type { WorkspaceRoleFormValues } from "@/features/workspace-roles/utils/workspace-role-form";

import { getCatalogOptionLabel } from "./team-role-permissions-i18n";

export type PermissionFormRow =
  | {
      kind: "boolean";
      item: WorkspacePermissionsCatalogItem;
      nested: boolean;
      disabledBy?: string;
    }
  | {
      kind: "option";
      item: WorkspacePermissionsCatalogItem;
      nested: boolean;
      disabledBy?: string;
    }
  | {
      kind: "integration_grants";
      item: WorkspacePermissionsCatalogItem;
    }
  | {
      kind: "product_reference_grants";
      item: WorkspacePermissionsCatalogItem;
    };

export const toSelectOptions = (
  t: TFunction,
  itemKey: string,
  options: WorkspacePermissionsCatalogOption[] | undefined,
) =>
  options?.map((option) => ({
    value: option.value,
    label: getCatalogOptionLabel(t, itemKey, option),
  })) ?? [];

const getModuleRootReadKey = (
  module: WorkspacePermissionsCatalogModule,
): string | undefined => {
  const keys = collectModuleBooleanKeys(module);
  const rootReadKey = `${module.module}.read`;

  return keys.includes(rootReadKey) ? rootReadKey : undefined;
};

const collectItemBooleanKeys = (
  item: WorkspacePermissionsCatalogItem,
): string[] => {
  const childKeys = [
    ...(item.scope ? collectItemBooleanKeys(item.scope) : []),
    ...(item.items?.flatMap(collectItemBooleanKeys) ?? []),
  ];

  if (item.type === "boolean" && item.storage === "permissions") {
    return [item.key, ...childKeys];
  }

  return childKeys;
};

const collectModuleBooleanKeys = (
  module: WorkspacePermissionsCatalogModule,
): string[] => module.items.flatMap(collectItemBooleanKeys);

const getNestedReadParentKey = (
  key: string,
  permissionKeys: Set<string>,
): string | undefined => {
  const parts = key.split(".");

  if (parts.length < 3) {
    return undefined;
  }

  const parentReadKey = `${parts.slice(0, -1).join(".")}.read`;

  if (parentReadKey === key) {
    return undefined;
  }

  return permissionKeys.has(parentReadKey) ? parentReadKey : undefined;
};

const getDisabledBy = (
  key: string,
  moduleRootReadKey: string | undefined,
  permissionKeys: Set<string>,
): string | undefined =>
  getNestedReadParentKey(key, permissionKeys) ??
  (moduleRootReadKey && key !== moduleRootReadKey
    ? moduleRootReadKey
    : undefined);

const collectRowsFromItem = (
  item: WorkspacePermissionsCatalogItem,
  options: {
    nested: boolean;
    moduleRootReadKey?: string;
    permissionKeys: Set<string>;
  },
): PermissionFormRow[] => {
  switch (item.type) {
    case "boolean":
      return [
        {
          kind: "boolean",
          item,
          nested: options.nested,
          disabledBy: getDisabledBy(
            item.key,
            options.moduleRootReadKey,
            options.permissionKeys,
          ),
        },
      ];

    case "option":
      return [
        {
          kind: "option",
          item,
          nested: options.nested,
          disabledBy: options.moduleRootReadKey,
        },
      ];

    case "group":
      return [
        ...(item.scope
          ? collectRowsFromItem(item.scope, {
              ...options,
              nested: true,
            })
          : []),
        ...(item.items?.flatMap((child) =>
          collectRowsFromItem(child, {
            ...options,
            nested: true,
          }),
        ) ?? []),
      ];

    case "integration_grants":
      return [{ kind: "integration_grants", item }];

    case "product_reference_grants":
      return [{ kind: "product_reference_grants", item }];

    default:
      return [];
  }
};

export const collectRowsFromModule = (
  module: WorkspacePermissionsCatalogModule,
): PermissionFormRow[] => {
  const permissionKeys = new Set(collectModuleBooleanKeys(module));
  const moduleRootReadKey = getModuleRootReadKey(module);

  return module.items.flatMap((item) =>
    collectRowsFromItem(item, {
      nested:
        item.type === "boolean" &&
        moduleRootReadKey != null &&
        item.key !== moduleRootReadKey,
      moduleRootReadKey,
      permissionKeys,
    }),
  );
};

export const getPermissionsValues = (
  form: FormInstance<WorkspaceRoleFormValues>,
): Record<string, boolean> =>
  (form.getFieldValue("permissions") as Record<string, boolean> | undefined) ??
  {};

export const setPermissionValues = (
  form: FormInstance<WorkspaceRoleFormValues>,
  values: Record<string, boolean>,
): void => {
  form.setFieldsValue({
    permissions: {
      ...getPermissionsValues(form),
      ...values,
    },
  });
};

export const isPermissionDisabled = (
  permissions: Record<string, boolean>,
  disabledBy: string | undefined,
): boolean => disabledBy != null && permissions[disabledBy] !== true;

export const areRequiredPermissionsEnabled = (
  permissions: Record<string, boolean>,
  requires: string[] | undefined,
): boolean =>
  !requires?.length || requires.every((key) => permissions[key] === true);

export const isGrantItemVisibleForIntegration = (
  item: WorkspacePermissionsCatalogItem,
  integrationType: string,
): boolean =>
  !item.integrationTypes || item.integrationTypes.includes(integrationType);
