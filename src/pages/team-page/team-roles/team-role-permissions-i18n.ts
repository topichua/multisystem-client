import type { TFunction } from "i18next";

import type {
  WorkspacePermissionsCatalogItem,
  WorkspacePermissionsCatalogModule,
  WorkspacePermissionsCatalogOption,
} from "@/features/workspace-roles/model/workspace-role.types";

const getCatalogItemFallback = (
  item: WorkspacePermissionsCatalogItem,
): string => item.label ?? item.description ?? item.key;

const toSnakeCaseSegment = (segment: string): string =>
  segment
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase();

const getPermissionTranslationKeys = (key: string): string[] => {
  const keys = new Set<string>();

  keys.add(key.replace(/\./g, "_"));

  const snakeKey = key.split(".").map(toSnakeCaseSegment).join("_");

  keys.add(snakeKey);

  return Array.from(keys);
};

const getFlatTranslation = (
  t: TFunction,
  baseKey: string,
  permissionKey: string,
): string | undefined => {
  for (const translationKey of getPermissionTranslationKeys(permissionKey)) {
    const translated = t(`${baseKey}.${translationKey}`, { defaultValue: "" });

    if (translated) {
      return translated;
    }
  }

  return undefined;
};

export const getCatalogItemLabel = (
  t: TFunction,
  item: WorkspacePermissionsCatalogItem,
): string => {
  const fallback = getCatalogItemFallback(item);
  const flatTranslation = getFlatTranslation(
    t,
    "team.permissions.itemsByKey",
    item.key,
  );

  if (flatTranslation) {
    return flatTranslation;
  }

  return t(`team.permissions.items.${item.key}`, {
    defaultValue: fallback,
  });
};

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
): string => {
  for (const translationKey of getPermissionTranslationKeys(itemKey)) {
    const flatTranslation = t(
      `team.permissions.optionValuesByKey.${translationKey}_${option.value}`,
      { defaultValue: "" },
    );

    if (flatTranslation) {
      return flatTranslation;
    }
  }

  return t(`team.permissions.optionValues.${itemKey}.${option.value}`, {
    defaultValue: option.label,
  });
};

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
