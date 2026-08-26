import { ArchiveIcon, ClockIcon, WarningIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import type { ConversationGroup } from "./model/conversation-group.types";
import {
  type FollowUpSystemGroupKey,
  type FooterSystemGroupKey,
  isFollowUpSystemGroup,
  isFooterSystemGroup,
} from "./model/system-groups";

export const followUpSystemGroupIcons: Record<FollowUpSystemGroupKey, Icon> = {
  pending_follow_up: ClockIcon,
};

export const footerSystemGroupIcons: Record<FooterSystemGroupKey, Icon> = {
  archived: ArchiveIcon,
  spam: WarningIcon,
};

export const getSpecialSystemGroupIcon = (
  group: ConversationGroup,
): Icon | undefined => {
  if (isFollowUpSystemGroup(group)) {
    return followUpSystemGroupIcons[group.systemKey];
  }

  if (isFooterSystemGroup(group)) {
    return footerSystemGroupIcons[group.systemKey];
  }

  return undefined;
};
