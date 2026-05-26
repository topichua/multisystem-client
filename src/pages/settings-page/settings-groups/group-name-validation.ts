import type { ConversationGroup } from "@/features/conversation-groups/model/conversation-group.types";

const normalizeNameKey = (name: string): string => name.trim().toLowerCase();

export const isDuplicateGroupName = (
  name: string,
  groups: ConversationGroup[],
  excludeGroupId?: number,
): boolean => {
  const key = normalizeNameKey(name);

  if (key === "") {
    return false;
  }

  return groups.some((g) => {
    if (excludeGroupId != null && g.id === excludeGroupId) {
      return false;
    }

    return normalizeNameKey(g.name) === key;
  });
};
