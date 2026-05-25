import type { ConversationMessage } from '@/features/conversations/model/types';

export const EMPTY_MESSAGES: ConversationMessage[] = [];

export const chronologicalConversationMessages = (messages: ConversationMessage[]) =>
  [...messages].reverse();

export const findLastOwnMessageIndex = (
  chronological: ConversationMessage[],
  selfInstagramId: string | number | null,
): number => {
  if (selfInstagramId == null) {
    return -1;
  }

  let last = -1;

  for (let i = 0; i < chronological.length; i++) {
    const fid = chronological[i].from?.id ?? null;

    if (fid != null && String(fid) === String(selfInstagramId)) {
      last = i;
    }
  }

  return last;
};

export const newestMessageScrollAnchor = (messagesNewestFirst: ConversationMessage[]): string => {
  const n = messagesNewestFirst[0];

  return n != null ? `${n.id}:${n.clientTempId ?? ''}:${n.outboundStatus ?? ''}` : '';
};
