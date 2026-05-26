import type { ConversationGroup } from "@/features/conversation-groups/model/conversation-group.types";

export const GROUP_TAG_ON_COLOR = "rgba(255,255,255,1)";

export type GroupSelectOptionData = {
  value: number;
  label: string;
  color: string;
};

export const toGroupSelectOptions = (
  groups: ConversationGroup[],
): GroupSelectOptionData[] =>
  groups.map((g) => ({
    value: g.id,
    label: g.name,
    color: g.color,
  }));
