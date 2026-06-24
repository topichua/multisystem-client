import { apiClient } from "@/api/api-client";

import type {
  Conversation,
  ConversationChannel,
  ConversationSource,
  ConversationsListResponse,
  ConversationMessage,
  ConversationUpdatePayload,
  MessageParticipant,
  MessagesListResponseBody,
  SendMessageApiResponse,
  SendMessagePayload,
} from "@/features/conversations/model/types";

const basePath = "/conversations";

export type ListConversationsParams = {
  groupIds?: number[];
};

export const isSendMessageApiResponse = (
  data: unknown,
): data is SendMessageApiResponse =>
  typeof data === "object" &&
  data !== null &&
  "message_id" in data &&
  typeof (data as SendMessageApiResponse).message_id === "string";

export const createOptimisticOutboundMessage = (
  payload: SendMessagePayload,
  sentBy: MessageParticipant | undefined,
  clientTempId: string,
): ConversationMessage => ({
  id: `local:${clientTempId}`,
  clientTempId,
  outboundStatus: "pending",
  created_time: new Date().toISOString(),
  conversation: {},
  from: sentBy
    ? { id: sentBy.id, name: sentBy.name, username: sentBy.username }
    : undefined,
  to: { data: [] },
  message: payload.message,
  is_unsupported: false,
  ...(payload.reply_to_id != null && payload.reply_to_id !== ""
    ? { reply_to_id: payload.reply_to_id }
    : {}),
});

const isConversationChannel = (value: unknown): value is ConversationChannel =>
  value === "instagram" || value === "telegram";

const isConversationSource = (value: unknown): value is ConversationSource =>
  value === 1 || value === 2;

const getConversationChannelBySource = (
  source: ConversationSource,
): ConversationChannel => (source === 2 ? "telegram" : "instagram");

const getConversationSourceByChannel = (
  channel: ConversationChannel,
): ConversationSource => (channel === "telegram" ? 2 : 1);

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const getString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const getNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const getOptionalNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const getConversationListItems = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  const record = getRecord(data);
  return Array.isArray(record.items) ? record.items : [];
};

const normalizeConversation = (raw: unknown): Conversation => {
  const record = getRecord(raw);
  const participant = getRecord(record.participant);
  const status = getRecord(record.status);
  const assignee = getRecord(record.assignee);
  const channel = isConversationChannel(record.channel)
    ? record.channel
    : "instagram";
  const source = isConversationSource(record.source)
    ? record.source
    : getConversationSourceByChannel(channel);
  const unreadCount =
    "unreadCount" in record
      ? getNumber(record.unreadCount)
      : record.isUnread
        ? 1
        : 0;

  return {
    id: getNumber(record.id),
    participant: {
      id:
        typeof participant.id === "number" || typeof participant.id === "string"
          ? participant.id
          : "",
      name: getString(participant.name),
      username:
        typeof participant.username === "string"
          ? participant.username
          : undefined,
      profilePic:
        typeof participant.profilePic === "string"
          ? participant.profilePic
          : null,
      initials:
        typeof participant.initials === "string"
          ? participant.initials
          : undefined,
      avatarColor:
        typeof participant.avatarColor === "string"
          ? participant.avatarColor
          : undefined,
    },
    channel: getConversationChannelBySource(source),
    source,
    groupId: getOptionalNumber(record.groupId),
    responsibleMemberId: getOptionalNumber(record.responsibleMemberId),
    lastMessage:
      typeof record.lastMessage === "string" ? record.lastMessage : null,
    isLastMessageFromMe: Boolean(record.isLastMessageFromMe),
    unreadCount,
    status:
      record.status != null
        ? {
            id: getNumber(status.id),
            name: getString(status.name),
            color: getString(status.color),
          }
        : null,
    assignee:
      record.assignee != null
        ? {
            id: getNumber(assignee.id),
            name: getString(assignee.name),
            profilePic:
              typeof assignee.profilePic === "string"
                ? assignee.profilePic
                : null,
            initials:
              typeof assignee.initials === "string"
                ? assignee.initials
                : undefined,
            avatarColor:
              typeof assignee.avatarColor === "string"
                ? assignee.avatarColor
                : undefined,
          }
        : null,
    instUpdatedAt: getString(record.instUpdatedAt, new Date().toISOString()),
  };
};

export const mergeLatestMessagesPageWithSendResult = (
  pageMessages: ConversationMessage[],
  raw: SendMessageApiResponse | ConversationMessage,
  payload: SendMessagePayload,
  sentBy: MessageParticipant | undefined,
): ConversationMessage[] => {
  if (!isSendMessageApiResponse(raw)) {
    return pageMessages;
  }

  const confirmedId = raw.message_id;
  if (pageMessages.some((m) => m.id === confirmedId)) {
    return pageMessages;
  }

  const confirmed = normalizeSentMessage(raw, payload, sentBy);
  return [confirmed, ...pageMessages.filter((m) => m.id !== confirmedId)];
};

export const normalizeSentMessage = (
  data: SendMessageApiResponse | ConversationMessage,
  payload: SendMessagePayload,
  sentBy?: MessageParticipant,
): ConversationMessage => {
  if (isSendMessageApiResponse(data)) {
    return {
      id: data.message_id,
      created_time: new Date().toISOString(),
      conversation: {},
      from: sentBy
        ? {
            id: sentBy.id,
            name: sentBy.name,
            username: sentBy.username,
          }
        : undefined,
      to: { data: [] },
      message: payload.message,
      is_unsupported: false,
      ...(payload.reply_to_id != null && payload.reply_to_id !== ""
        ? { reply_to_id: payload.reply_to_id }
        : {}),
    };
  }

  return data;
};

export type GetMessagesResult = {
  messages: ConversationMessage[];
  paging: MessagesListResponseBody["paging"];
};

export type GetMessagesParams = {
  page?: number;
  page_size?: number;
};

export const conversationsApi = {
  list: async (params?: ListConversationsParams) => {
    const query =
      params?.groupIds != null && params.groupIds.length > 0
        ? { groupIds: params.groupIds.join(",") }
        : undefined;

    const { data } = await apiClient.get<ConversationsListResponse>(basePath, {
      params: query,
    });

    return getConversationListItems(data).map(normalizeConversation);
  },

  update: async (
    conversationId: string,
    payload: ConversationUpdatePayload,
  ): Promise<Conversation | undefined> => {
    const { data } = await apiClient.put<unknown>(
      `${basePath}/${conversationId}`,
      payload,
    );

    if (
      data &&
      typeof data === "object" &&
      "id" in data &&
      typeof (data as { id: unknown }).id === "number"
    ) {
      return normalizeConversation(data);
    }

    return undefined;
  },

  getMessages: async (
    conversationId: string,
    params?: GetMessagesParams,
  ): Promise<GetMessagesResult> => {
    const { data } = await apiClient.get<MessagesListResponseBody>(
      `${basePath}/${conversationId}/messages`,
      {
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 50,
        },
      },
    );

    return {
      messages: data.data ?? [],
      paging: data.paging,
    };
  },

  sendMessage: async (
    conversationId: string,
    payload: SendMessagePayload,
  ): Promise<SendMessageApiResponse | ConversationMessage> => {
    const { data } = await apiClient.post<
      SendMessageApiResponse | ConversationMessage
    >(`${basePath}/${conversationId}/messages`, payload);

    return data;
  },
};
