import type { Icon } from "@phosphor-icons/react";
import {
  ChatCircleDotsIcon,
  InfoIcon,
  TagIcon,
  UserIcon,
  ArrowArcRightIcon,
} from "@phosphor-icons/react";

import { base } from "@/styled/definitions/colors";
import type { ConversationEventType } from "@/features/conversations/model/types";

export type ConversationEventVisual = {
  color: string;
  Icon: Icon;
};

const conversationEventVisualByType: Record<string, ConversationEventVisual> = {
  conversation_created: {
    color: base.blue[5],
    Icon: ChatCircleDotsIcon,
  },
  group_changed: {
    color: base.green[5],
    Icon: ArrowArcRightIcon,
  },
  responsible_changed: {
    color: base.violet[5],
    Icon: UserIcon,
  },
  order_created: {
    color: base.orange[5],
    Icon: TagIcon,
  },
};

const fallbackConversationEventVisual: ConversationEventVisual = {
  color: base.grey[6],
  Icon: InfoIcon,
};

export const getConversationEventVisual = (
  type: ConversationEventType,
): ConversationEventVisual =>
  conversationEventVisualByType[type] ?? fallbackConversationEventVisual;
