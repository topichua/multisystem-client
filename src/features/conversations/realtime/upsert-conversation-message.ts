import type { ConversationMessage } from '@/features/conversations/model/types';

export const isNewConversationMessage = (
  existing: ConversationMessage[],
  messageId: string,
): boolean => !existing.some((message) => message.id === messageId);

/** Messages in the store are newest-first; upsert by Instagram mid. */
export const upsertConversationMessage = (
  existing: ConversationMessage[],
  incoming: ConversationMessage,
): ConversationMessage[] => {
  const index = existing.findIndex((message) => message.id === incoming.id);

  if (index >= 0) {
    const next = [...existing];

    next[index] = {
      ...incoming,
      clientTempId: undefined,
      outboundStatus: undefined,
      sendError: undefined,
    };

    return next;
  }

  return [incoming, ...existing];
};
