import type { Conversation } from './types';

export const sortConversationsByInstUpdatedAt = (items: Conversation[]): Conversation[] =>
  [...items].sort(
    (a, b) => new Date(b.instUpdatedAt).getTime() - new Date(a.instUpdatedAt).getTime(),
  );
