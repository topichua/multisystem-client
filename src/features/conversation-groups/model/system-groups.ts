import type { ConversationGroup } from "./conversation-group.types";

export const FOOTER_SYSTEM_GROUP_KEYS = ["archived", "spam"] as const;

export type FooterSystemGroupKey = (typeof FOOTER_SYSTEM_GROUP_KEYS)[number];

const footerSystemGroupKeySet: Record<string, true> =
  FOOTER_SYSTEM_GROUP_KEYS.reduce<Record<string, true>>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});

export const isFooterSystemGroup = (
  group: ConversationGroup,
): group is ConversationGroup & { systemKey: FooterSystemGroupKey } =>
  Boolean(
    group.isSystem &&
    group.systemKey &&
    footerSystemGroupKeySet[group.systemKey],
  );
