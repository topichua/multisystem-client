import type { MessageParticipant } from '@/features/conversations/model/types';
import i18n from '@/i18n';

export const replyQuoteAuthorLabel = (from?: MessageParticipant): string => {
  const name = from?.name?.trim();
  if (name) {
    return name;
  }

  const username = from?.username?.trim();
  if (username) {
    return `@${username}`;
  }

  return i18n.t('messages.ellipsisSnippet');
};
