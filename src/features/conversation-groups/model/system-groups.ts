import type { TFunction } from "i18next";

import type { ConversationGroup } from "./conversation-group.types";

export const SYSTEM_GROUP_KEYS = [
  "new",
  "processing",
  "pending_follow_up",
  "archived",
  "spam",
] as const;

export type SystemGroupKey = (typeof SYSTEM_GROUP_KEYS)[number];

export const FOLLOW_UP_SYSTEM_GROUP_KEYS = ["pending_follow_up"] as const;

export type FollowUpSystemGroupKey =
  (typeof FOLLOW_UP_SYSTEM_GROUP_KEYS)[number];

export const FOOTER_SYSTEM_GROUP_KEYS = ["archived", "spam"] as const;

export type FooterSystemGroupKey = (typeof FOOTER_SYSTEM_GROUP_KEYS)[number];

const toKeySet = (keys: readonly string[]): Record<string, true> =>
  keys.reduce<Record<string, true>>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});

const systemGroupKeySet = toKeySet(SYSTEM_GROUP_KEYS);
const followUpSystemGroupKeySet = toKeySet(FOLLOW_UP_SYSTEM_GROUP_KEYS);
const footerSystemGroupKeySet = toKeySet(FOOTER_SYSTEM_GROUP_KEYS);

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

export const isFollowUpSystemGroup = (
  group: ConversationGroup,
): group is ConversationGroup & { systemKey: FollowUpSystemGroupKey } =>
  Boolean(
    group.isSystem &&
    group.systemKey &&
    followUpSystemGroupKeySet[group.systemKey],
  );

export const isFooterSystemGroup = (
  group: ConversationGroup,
): group is ConversationGroup & { systemKey: FooterSystemGroupKey } =>
  Boolean(
    group.isSystem &&
    group.systemKey &&
    footerSystemGroupKeySet[group.systemKey],
  );

export const partitionConversationGroups = (groups: ConversationGroup[]) => {
  const sortedGroups = [...groups].sort(
    (firstGroup, secondGroup) => firstGroup.sortOrder - secondGroup.sortOrder,
  );

  return {
    regularGroups: sortedGroups.filter(
      (group) => !isFollowUpSystemGroup(group) && !isFooterSystemGroup(group),
    ),
    followUpSystemGroups: sortedGroups.filter(isFollowUpSystemGroup),
    footerSystemGroups: sortedGroups.filter(isFooterSystemGroup),
  };
};

export const getOrderedConversationGroups = (
  groups: ConversationGroup[],
): ConversationGroup[] => {
  const { regularGroups, followUpSystemGroups, footerSystemGroups } =
    partitionConversationGroups(groups);

  return [...regularGroups, ...followUpSystemGroups, ...footerSystemGroups];
};

export const getManageableConversationGroups = (
  groups: ConversationGroup[],
): ConversationGroup[] => partitionConversationGroups(groups).regularGroups;
