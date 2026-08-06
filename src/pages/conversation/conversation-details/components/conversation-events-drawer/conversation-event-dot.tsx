import type { ConversationEventType } from "@/features/conversations/model/types";

import { getConversationEventVisual } from "./conversation-event-visual";

type ConversationEventDotProps = {
  type: ConversationEventType;
};

export function ConversationEventDot({ type }: ConversationEventDotProps) {
  const { color, Icon } = getConversationEventVisual(type);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: "50%",
        backgroundColor: color,
        color: "#fff",
        flexShrink: 0,
        transform: "translateY(8px)",
      }}
    >
      <Icon size={14} weight="bold" />
    </span>
  );
}
