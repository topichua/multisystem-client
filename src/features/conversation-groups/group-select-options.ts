import type { TFunction } from "i18next";

import type { ConversationGroup } from "@/features/conversation-groups/model/conversation-group.types";
import {
  type FooterSystemGroupKey,
  getConversationGroupDisplayName,
  isFooterSystemGroup,
} from "@/features/conversation-groups/model/system-groups";

export const GROUP_TAG_ON_COLOR = "rgba(255,255,255,1)";

export type GroupSelectOptionData = {
  value: number;
  label: string;
  color: string;
  footerSystemKey?: FooterSystemGroupKey;
};

const toGroupSelectOption = (
  group: ConversationGroup,
  t: TFunction,
): GroupSelectOptionData => ({
  value: group.id,
  label: getConversationGroupDisplayName(group, t),
  color: group.color,
});

export const toGroupSelectOptions = (
  groups: ConversationGroup[],
  t: TFunction,
): GroupSelectOptionData[] => {
  const sortedGroups = [...groups].sort(
    (firstGroup, secondGroup) => firstGroup.sortOrder - secondGroup.sortOrder,
  );
  const regularGroups = sortedGroups.filter(
    (group) => !isFooterSystemGroup(group),
  );
  const footerSystemGroups = sortedGroups.filter(isFooterSystemGroup);

  return [
    ...regularGroups.map((group) => toGroupSelectOption(group, t)),
    ...footerSystemGroups.map((group) => ({
      ...toGroupSelectOption(group, t),
      footerSystemKey: group.systemKey,
    })),
  ];
};
