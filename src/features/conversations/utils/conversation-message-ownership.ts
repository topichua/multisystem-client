import type {
  ConversationChannel,
  ConversationMessage,
} from "@/features/conversations/model/types";

export type ConversationSelfIds = {
  instagram: string | number | null;
  telegram: string | number | null;
};

export type ConversationOwnershipContext = {
  channel?: ConversationChannel;
  selfIds: ConversationSelfIds;
  participantId?: string | number | null;
  messages?: ConversationMessage[];
};

const TELEGRAM_MESSAGE_ID_PATTERN = /^tg:[^:]+:/;

export const isTelegramConversationMessageId = (messageId: string): boolean =>
  TELEGRAM_MESSAGE_ID_PATTERN.test(messageId);

export const resolveTelegramSelfAccountId = (
  messages: ConversationMessage[],
  integrationAccountId?: string | number | null,
  participantId?: string | number | null,
): string | null => {
  const participantKey = participantId != null ? String(participantId) : null;

  if (
    integrationAccountId != null &&
    String(integrationAccountId).trim() &&
    (participantKey == null || String(integrationAccountId) !== participantKey)
  ) {
    return String(integrationAccountId);
  }

  if (participantKey == null) {
    return null;
  }

  for (const message of messages) {
    const fromId = message.from?.id;

    if (fromId != null && String(fromId) !== participantKey) {
      return String(fromId);
    }
  }

  return null;
};

export const resolveSelfAccountId = ({
  channel,
  selfIds,
  participantId = null,
  messages = [],
}: ConversationOwnershipContext): string | null => {
  if (channel === "telegram") {
    return resolveTelegramSelfAccountId(
      messages,
      selfIds.telegram,
      participantId,
    );
  }

  if (channel === "instagram" || selfIds.instagram != null) {
    return selfIds.instagram != null ? String(selfIds.instagram) : null;
  }

  return null;
};

export const resolveSelfAccountIdForMessage = (
  message: Pick<ConversationMessage, "id" | "from">,
  selfIds: ConversationSelfIds,
  participantId?: string | number | null,
): string | null => {
  if (isTelegramConversationMessageId(message.id)) {
    if (selfIds.telegram != null && String(selfIds.telegram).trim()) {
      return String(selfIds.telegram);
    }

    const fromId = message.from?.id;

    if (
      fromId != null &&
      participantId != null &&
      String(fromId) !== String(participantId)
    ) {
      return String(fromId);
    }

    return null;
  }

  return selfIds.instagram != null ? String(selfIds.instagram) : null;
};

export const isOwnConversationMessage = (
  message: ConversationMessage,
  context: ConversationOwnershipContext,
): boolean => {
  if (
    message.outboundStatus === "pending" ||
    message.outboundStatus === "failed"
  ) {
    return true;
  }

  const fromId = message.from?.id ?? null;

  if (fromId == null) {
    return false;
  }

  if (context.channel === "telegram") {
    const participantId = context.participantId;

    if (participantId != null) {
      return String(fromId) !== String(participantId);
    }

    const selfAccountId = resolveSelfAccountId(context);

    return selfAccountId != null && String(fromId) === selfAccountId;
  }

  const selfAccountId = resolveSelfAccountId(context);

  if (selfAccountId == null) {
    return false;
  }

  return String(fromId) === selfAccountId;
};

export const findLastOwnMessageIndex = (
  chronological: ConversationMessage[],
  context: ConversationOwnershipContext,
): number => {
  let last = -1;

  for (let i = 0; i < chronological.length; i++) {
    if (isOwnConversationMessage(chronological[i], context)) {
      last = i;
    }
  }

  return last;
};
