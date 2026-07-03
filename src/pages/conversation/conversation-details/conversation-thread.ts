import type { ConversationMessage } from "@/features/conversations/model/types";

export { findLastOwnMessageIndex } from "@/features/conversations/utils/conversation-message-ownership";

export const EMPTY_MESSAGES: ConversationMessage[] = [];

export const chronologicalConversationMessages = (
  messages: ConversationMessage[],
) => [...messages].reverse();

export const newestMessageScrollAnchor = (
  messagesNewestFirst: ConversationMessage[],
): string => {
  const n = messagesNewestFirst[0];

  return n != null
    ? `${n.id}:${n.clientTempId ?? ""}:${n.outboundStatus ?? ""}`
    : "";
};
