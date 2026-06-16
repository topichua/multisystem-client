import type { TFunction } from "i18next";

import type {
  WorkspacePermissionsCatalogItem,
  WorkspacePermissionsCatalogModule,
  WorkspacePermissionsCatalogOption,
} from "@/features/workspace-roles/model/workspace-role.types";

const getCatalogItemFallback = (
  item: WorkspacePermissionsCatalogItem,
): string => item.label ?? item.description ?? item.key;

export const getCatalogItemLabel = (
  t: TFunction,
  item: WorkspacePermissionsCatalogItem,
): string =>
  t(`team.permissions.items.${item.key}`, {
    defaultValue: getCatalogItemFallback(item),
  });

export const getCatalogModuleLabel = (
  t: TFunction,
  module: WorkspacePermissionsCatalogModule,
): string =>
  t(`team.permissions.modules.${module.module}`, {
    defaultValue: module.label,
  });

export const getCatalogOptionLabel = (
  t: TFunction,
  itemKey: string,
  option: WorkspacePermissionsCatalogOption,
): string =>
  t(`team.permissions.optionValues.${itemKey}.${option.value}`, {
    defaultValue: option.label,
  });

export const getIntegrationTypeLabel = (
  t: TFunction,
  integrationType: string,
): string =>
  t(`integrations.types.${integrationType}.label`, {
    defaultValue: integrationType,
  });

export const getIntegrationGrantFallbackName = (
  t: TFunction,
  integrationType: string,
  integrationId: number,
): string =>
  t("team.permissions.integrationGrantFallback", {
    type: getIntegrationTypeLabel(t, integrationType),
    id: integrationId,
    defaultValue: `${integrationType} #${integrationId}`,
  });
