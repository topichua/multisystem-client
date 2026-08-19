import { apiClient } from "@/api/api-client";

import type {
  Conversation,
  ConversationChannel,
  ConversationEvent,
  ConversationEventsListResponse,
  ConversationFollowUp,
  ConversationFollowUpDetails,
  ConversationFollowUpWritePayload,
  ConversationProductSuggestionsResponse,
  ConversationSource,
  ConversationMessage,
  ConversationUpdatePayload,
  MessageParticipant,
  MessagesListResponseBody,
  SendMessageApiResponse,
  SendMessagePayload,
} from "@/features/conversations/model/types";

const basePath = "/conversations";

export type ConversationListCounters = {
  total: number;
  unread: number;
  withoutResponsible: number;
};

export type ListConversationsResult = {
  conversations: Conversation[];
  counters: ConversationListCounters;
};

export type ListConversationsParams = {
  groupIds?: number[];
  channelIds?: number[];
  responsibleUserIds?: number[];
  keyword?: string;
  unreadOnly?: boolean;
  showWithoutResponsibleOnly?: boolean;
  groupingBy?: ConversationGroupingBy;
  groupingId?: string;
};

export type ConversationGroupingBy =
  "responsible" | "status" | "createdAt" | "channel";

export type ConversationGroupBucketChannel = {
  integrationId: number;
  type: ConversationChannel;
  name: string;
};

export type ConversationGroupBucketMeta = {
  responsibleMemberId: number | null;
  groupId: number | null;
  systemKey: string;
  color: string;
  createdAtBucket: string;
  channel: ConversationGroupBucketChannel | null;
};

export type ConversationGroupBucket = {
  key: string;
  label: string;
  count: number;
  meta: ConversationGroupBucketMeta;
};

export type ConversationGroupsResult = {
  by: ConversationGroupingBy;
  total: number;
  items: ConversationGroupBucket[];
};

export type ConversationCriteriaChannel = {
  integrationId: number;
  name: string;
  type: ConversationChannel;
};

export type ConversationCriteriaResponsibleUser = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
};

export type ConversationCriteria = {
  channels: ConversationCriteriaChannel[];
  responsibleUsers: ConversationCriteriaResponsibleUser[];
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
  type: "text",
  is_unsupported: false,
  ...(payload.reply_to_id != null && payload.reply_to_id !== ""
    ? { reply_to_id: payload.reply_to_id }
    : {}),
});

const isConversationChannel = (value: unknown): value is ConversationChannel =>
  value === "instagram" || value === "telegram";

const isConversationGroupingBy = (
  value: unknown,
): value is ConversationGroupingBy =>
  value === "responsible" ||
  value === "status" ||
  value === "createdAt" ||
  value === "channel";

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

const getBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

const getOptionalString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const unwrapFollowUpRecord = (value: unknown): Record<string, unknown> => {
  const record = getRecord(value);

  return record.followUp != null && typeof record.followUp === "object"
    ? getRecord(record.followUp)
    : record;
};

const parseFollowUp = (
  nested: Record<string, unknown>,
): ConversationFollowUp | null => {
  const id = getOptionalNumber(nested.id);
  const scheduledAt = getOptionalString(nested.scheduledAt);

  if (id == null || scheduledAt == null) {
    return null;
  }

  return { id, scheduledAt };
};

const normalizeFollowUp = (value: unknown): ConversationFollowUp | null =>
  parseFollowUp(unwrapFollowUpRecord(value));

const normalizeFollowUpDetails = (
  value: unknown,
): ConversationFollowUpDetails | null => {
  const nested = unwrapFollowUpRecord(value);
  const followUp = parseFollowUp(nested);

  if (followUp == null) {
    return null;
  }

  return {
    ...followUp,
    message: typeof nested.message === "string" ? nested.message : "",
    templateId: getOptionalNumber(nested.templateId),
    cancelOnReply: getBoolean(nested.cancelOnReply, true),
    status: typeof nested.status === "string" ? nested.status : undefined,
  };
};

const toFollowUpFromWriteResponse = (
  data: unknown,
  payload: ConversationFollowUpWritePayload,
): ConversationFollowUp =>
  normalizeFollowUp(data) ?? { id: 0, scheduledAt: payload.scheduledAt };

const followUpPath = (conversationId: string | number) =>
  `${basePath}/${encodeURIComponent(String(conversationId))}/follow-up`;

const getConversationListItems = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  const record = getRecord(data);
  return Array.isArray(record.items) ? record.items : [];
};

const getFallbackListCounters = (
  conversations: Conversation[],
): ConversationListCounters => ({
  total: conversations.length,
  unread: conversations.filter((conversation) => conversation.unreadCount > 0)
    .length,
  withoutResponsible: conversations.filter(
    (conversation) => conversation.responsibleMemberId == null,
  ).length,
});

const normalizeListCounters = (
  data: unknown,
  conversations: Conversation[],
): ConversationListCounters => {
  const counters = getRecord(getRecord(data).counters);
  const fallback = getFallbackListCounters(conversations);

  return {
    total: getNumber(counters.total, fallback.total),
    unread: getNumber(counters.unread, fallback.unread),
    withoutResponsible: getNumber(
      counters.withoutResponsible,
      fallback.withoutResponsible,
    ),
  };
};

const buildListQuery = (
  params?: ListConversationsParams,
): Record<string, string> | undefined => {
  const query: Record<string, string> = {};

  const appendIds = (key: string, ids?: number[]): void => {
    if (ids != null && ids.length > 0) {
      query[key] = ids.join(",");
    }
  };

  appendIds("groupIds", params?.groupIds);
  appendIds("channel_ids", params?.channelIds);
  appendIds("responsible_user_ids", params?.responsibleUserIds);

  const keyword = params?.keyword?.trim();
  if (keyword) {
    query.keyword = keyword;
  }

  if (params?.unreadOnly) {
    query.unread_only = "true";
  }

  if (params?.showWithoutResponsibleOnly) {
    query.show_without_responsible_only = "true";
  }

  const groupingId = params?.groupingId?.trim();
  if (params?.groupingBy && groupingId) {
    query.grouping_by = params.groupingBy;
    query.grouping_id = groupingId;
  }

  return Object.keys(query).length > 0 ? query : undefined;
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
      phone: getOptionalString(participant.phone),
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
    canTakeChat: getBoolean(record.canTakeChat),
    canAssignResponsible: getBoolean(record.canAssignResponsible),
    followUp: normalizeFollowUp(record.followUp),
  };
};

const normalizeConversationEvent = (raw: unknown): ConversationEvent => {
  const record = getRecord(raw);

  return {
    id: getNumber(record.id),
    conversationId: getNumber(record.conversationId),
    type: getString(record.type) as ConversationEvent["type"],
    actorId: getOptionalNumber(record.actorId),
    payload: getRecord(record.payload),
    createdAt: getString(record.createdAt),
  };
};

const normalizeConversationEvents = (
  raw: unknown,
): ConversationEventsListResponse => {
  const record = getRecord(raw);
  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(record.items)
      ? record.items
      : [];

  return {
    items: items
      .map(normalizeConversationEvent)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
  };
};

const normalizeConversationCriteriaChannel = (
  raw: unknown,
): ConversationCriteriaChannel | null => {
  const record = getRecord(raw);
  const integrationId = getOptionalNumber(record.integrationId);

  if (integrationId == null) {
    return null;
  }

  return {
    integrationId,
    name: getString(record.name),
    type: isConversationChannel(record.type) ? record.type : "instagram",
  };
};

const normalizeConversationCriteriaResponsibleUser = (
  raw: unknown,
): ConversationCriteriaResponsibleUser | null => {
  const record = getRecord(raw);
  const id = getOptionalNumber(record.id);

  if (id == null) {
    return null;
  }

  return {
    id,
    name: getString(record.name),
    email: getString(record.email),
    avatar: typeof record.avatar === "string" ? record.avatar : null,
  };
};

const normalizeConversationCriteria = (raw: unknown): ConversationCriteria => {
  const record = getRecord(raw);
  const channels = Array.isArray(record.channels) ? record.channels : [];
  const responsibleUsers = Array.isArray(record.responsibleUsers)
    ? record.responsibleUsers
    : [];

  return {
    channels: channels
      .map(normalizeConversationCriteriaChannel)
      .filter(
        (channel): channel is ConversationCriteriaChannel => channel !== null,
      ),
    responsibleUsers: responsibleUsers
      .map(normalizeConversationCriteriaResponsibleUser)
      .filter(
        (user): user is ConversationCriteriaResponsibleUser => user !== null,
      ),
  };
};

const normalizeConversationGroupBucketChannel = (
  raw: unknown,
): ConversationGroupBucketChannel | null => {
  const record = getRecord(raw);
  const integrationId = getOptionalNumber(record.integrationId);

  if (integrationId == null) {
    return null;
  }

  return {
    integrationId,
    type: isConversationChannel(record.type) ? record.type : "instagram",
    name: getString(record.name),
  };
};

const normalizeConversationGroupBucketMeta = (
  raw: unknown,
): ConversationGroupBucketMeta => {
  const record = getRecord(raw);

  return {
    responsibleMemberId: getOptionalNumber(record.responsibleMemberId),
    groupId: getOptionalNumber(record.groupId),
    systemKey: getString(record.systemKey),
    color: getString(record.color),
    createdAtBucket: getString(record.createdAtBucket),
    channel:
      record.channel == null
        ? null
        : normalizeConversationGroupBucketChannel(record.channel),
  };
};

const normalizeConversationGroupBucket = (
  raw: unknown,
): ConversationGroupBucket | null => {
  const record = getRecord(raw);
  const key = getString(record.key).trim();

  if (!key) {
    return null;
  }

  return {
    key,
    label: getString(record.label, key),
    count: getNumber(record.count),
    meta: normalizeConversationGroupBucketMeta(record.meta),
  };
};

const normalizeConversationGroups = (
  raw: unknown,
  fallbackBy: ConversationGroupingBy,
): ConversationGroupsResult => {
  const record = getRecord(raw);
  const items = Array.isArray(record.items) ? record.items : [];

  return {
    by: isConversationGroupingBy(record.by) ? record.by : fallbackBy,
    total: getNumber(record.total),
    items: items
      .map(normalizeConversationGroupBucket)
      .filter((item): item is ConversationGroupBucket => item !== null),
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
      type: "text",
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
  criteria: async (): Promise<ConversationCriteria> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/criteria`);

    return normalizeConversationCriteria(data);
  },

  list: async (
    params?: ListConversationsParams,
  ): Promise<ListConversationsResult> => {
    const { data } = await apiClient.get<unknown>(basePath, {
      params: buildListQuery(params),
    });

    const conversations = getConversationListItems(data).map(
      normalizeConversation,
    );

    return {
      conversations,
      counters: normalizeListCounters(data, conversations),
    };
  },

  groups: async (
    by: ConversationGroupingBy,
  ): Promise<ConversationGroupsResult> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/groups`, {
      params: { by },
    });

    return normalizeConversationGroups(data, by);
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

  delete: async (conversationId: string | number): Promise<void> => {
    await apiClient.delete(
      `${basePath}/${encodeURIComponent(String(conversationId))}`,
    );
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

  getProductSuggestions: async (
    conversationId: string,
  ): Promise<ConversationProductSuggestionsResponse> => {
    const { data } =
      await apiClient.get<ConversationProductSuggestionsResponse>(
        `${basePath}/${conversationId}/suggestions`,
      );

    return data;
  },

  getEvents: async (
    conversationId: string,
  ): Promise<ConversationEventsListResponse> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/${encodeURIComponent(conversationId)}/events`,
    );

    return normalizeConversationEvents(data);
  },

  getFollowUp: async (
    conversationId: string | number,
  ): Promise<ConversationFollowUpDetails | null> => {
    const { data } = await apiClient.get<unknown>(followUpPath(conversationId));

    return normalizeFollowUpDetails(data);
  },

  createFollowUp: async (
    conversationId: string | number,
    payload: ConversationFollowUpWritePayload,
  ): Promise<ConversationFollowUp> => {
    const { data } = await apiClient.post<unknown>(
      followUpPath(conversationId),
      payload,
    );

    return toFollowUpFromWriteResponse(data, payload);
  },

  updateFollowUp: async (
    conversationId: string | number,
    payload: ConversationFollowUpWritePayload,
  ): Promise<ConversationFollowUp> => {
    const { data } = await apiClient.patch<unknown>(
      followUpPath(conversationId),
      payload,
    );

    return toFollowUpFromWriteResponse(data, payload);
  },

  deleteFollowUp: async (conversationId: string | number): Promise<void> => {
    await apiClient.delete(followUpPath(conversationId));
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
