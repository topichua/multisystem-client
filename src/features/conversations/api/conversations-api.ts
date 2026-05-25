import { apiClient } from '@/api/api-client';

import type {
  Conversation,
  ConversationsListResponse,
  ConversationMessage,
  ConversationUpdatePayload,
  MessageParticipant,
  MessagesListResponseBody,
  SendMessageApiResponse,
  SendMessagePayload,
  SyncConversationsPayload,
} from '@/features/conversations/model/types';

const basePath = '/conversations';

export type ListConversationsParams = {
  groupIds?: number[];
};

export const isSendMessageApiResponse = (data: unknown): data is SendMessageApiResponse =>
  typeof data === 'object' &&
  data !== null &&
  'message_id' in data &&
  typeof (data as SendMessageApiResponse).message_id === 'string';

export const createOptimisticOutboundMessage = (
  payload: SendMessagePayload,
  sentBy: MessageParticipant | undefined,
  clientTempId: string,
): ConversationMessage => ({
  id: `local:${clientTempId}`,
  clientTempId,
  outboundStatus: 'pending',
  created_time: new Date().toISOString(),
  conversation: {},
  from: sentBy ? { id: sentBy.id, name: sentBy.name, username: sentBy.username } : undefined,
  to: { data: [] },
  message: payload.message,
  is_unsupported: false,
  ...(payload.reply_to_id != null && payload.reply_to_id !== ''
    ? { reply_to_id: payload.reply_to_id }
    : {}),
});

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
      ...(payload.reply_to_id != null && payload.reply_to_id !== ''
        ? { reply_to_id: payload.reply_to_id }
        : {}),
    };
  }

  return data;
};

export type GetMessagesResult = {
  messages: ConversationMessage[];
  paging: MessagesListResponseBody['paging'];
};

export type GetMessagesParams = {
  page?: number;
  page_size?: number;
};

export const conversationsApi = {
  list: async (params?: ListConversationsParams) => {
    const query =
      params?.groupIds != null && params.groupIds.length > 0
        ? { groupIds: params.groupIds.join(',') }
        : undefined;

    const { data } = await apiClient.get<ConversationsListResponse>(basePath, {
      params: query,
    });

    return data.items;
  },

  sync: async (payload?: SyncConversationsPayload) => {
    const { data } = await apiClient.post<unknown>(`${basePath}/sync`, payload ?? {});

    return data;
  },

  getById: async (conversationId: string) => {
    const { data } = await apiClient.get<Conversation>(`${basePath}/${conversationId}`);

    return data;
  },

  update: async (
    conversationId: string,
    payload: ConversationUpdatePayload,
  ): Promise<Conversation | undefined> => {
    const { data } = await apiClient.put<unknown>(`${basePath}/${conversationId}`, payload);

    if (
      data &&
      typeof data === 'object' &&
      'id' in data &&
      typeof (data as { id: unknown }).id === 'number'
    ) {
      return data as Conversation;
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
    const { data } = await apiClient.post<SendMessageApiResponse | ConversationMessage>(
      `${basePath}/${conversationId}/messages`,
      payload,
    );

    return data;
  },
};
