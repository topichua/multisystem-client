import type { TFunction } from "i18next";

import type { ConversationGroup } from "./conversation-group.types";

export const SYSTEM_GROUP_KEYS = [
  "new",
  "processing",
  "archived",
  "spam",
] as const;

export type SystemGroupKey = (typeof SYSTEM_GROUP_KEYS)[number];

export const FOOTER_SYSTEM_GROUP_KEYS = ["archived", "spam"] as const;

export type FooterSystemGroupKey = (typeof FOOTER_SYSTEM_GROUP_KEYS)[number];

const systemGroupKeySet: Record<string, true> = SYSTEM_GROUP_KEYS.reduce<
  Record<string, true>
>((acc, key) => {
  acc[key] = true;
  return acc;
}, {});

const footerSystemGroupKeySet: Record<string, true> =
  FOOTER_SYSTEM_GROUP_KEYS.reduce<Record<string, true>>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});

export const isSystemGroupKey = (value: string): value is SystemGroupKey =>
  Boolean(systemGroupKeySet[value]);

export const getConversationGroupSystemNameKey = (
  systemKey: string | null | undefined,
): `groups.systemKeys.${SystemGroupKey}` | null => {
  if (!systemKey || !isSystemGroupKey(systemKey)) {
    return null;
  }

  return `groups.systemKeys.${systemKey}`;
};

export const getConversationGroupDisplayName = (
  group: Pick<ConversationGroup, "name" | "systemKey">,
  t: TFunction,
): string => {
  const nameKey = getConversationGroupSystemNameKey(group.systemKey);

  return nameKey ? t(nameKey) : group.name;
};

export const isFooterSystemGroup = (
  group: ConversationGroup,
): group is ConversationGroup & { systemKey: FooterSystemGroupKey } =>
  Boolean(
    group.isSystem &&
    group.systemKey &&
    footerSystemGroupKeySet[group.systemKey],
  );
