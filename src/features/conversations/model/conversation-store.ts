import { makeAutoObservable, runInAction } from "mobx";

import {
  conversationsApi,
  createOptimisticOutboundMessage,
  mergeLatestMessagesPageWithSendResult,
  normalizeSentMessage,
  type ConversationListCounters,
  type ListConversationsParams,
} from "@/features/conversations/api/conversations-api";

import { normalizeInstagramMessage } from "@/features/conversations/realtime/normalize-instagram-message";
import type {
  ConversationsUpdatePayload,
  InstagramMessageDto,
} from "@/features/conversations/realtime/conversations-realtime.types";
import { playNewMessageNotification } from "@/features/conversations/realtime/play-new-message-notification";
import {
  isNewConversationMessage,
  upsertConversationMessage,
} from "@/features/conversations/realtime/upsert-conversation-message";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import { sortConversationsByInstUpdatedAt } from "./sort-conversations";
import type {
  Conversation,
  ConversationMessage,
  ConversationProductSuggestionsResponse,
  MessageParticipant,
  MessagesPaging,
  SendMessagePayload,
} from "./types";
import {
  resolveSelfAccountIdForMessage,
  type ConversationSelfIds,
} from "@/features/conversations/utils/conversation-message-ownership";

export type ConversationListSegment = "all" | "unread" | "withoutResponsible";

export type ConversationListFilters = {
  channelIds?: number[];
  responsibleUserIds?: number[];
};

const EMPTY_LIST_COUNTERS: ConversationListCounters = {
  total: 0,
  unread: 0,
  withoutResponsible: 0,
};

const normalizeListGroupFilterIds = (ids: number[]): number[] =>
  [...new Set(ids)]
    .filter((id) => Number.isInteger(id) && id > 0)
    .sort((a, b) => a - b);

const sameSortedNumberList = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((id, i) => id === b[i]);

const createClientTempId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

function appendOlderMessageBatch(
  existing: ConversationMessage[],
  batch: ConversationMessage[],
): ConversationMessage[] {
  const seen = new Set(existing.map((m) => m.id));
  const appended = batch.filter((m) => !seen.has(m.id));

  return appended.length === 0 ? existing : [...existing, ...appended];
}

function mergeLatestPagePreservingLocalOutboundMessages(
  existing: ConversationMessage[],
  latestPage: ConversationMessage[],
  excludeClientTempId?: string,
): ConversationMessage[] {
  const latestIds = new Set(latestPage.map((m) => m.id));
  const latestClientTempIds = new Set(
    latestPage
      .map((m) => m.clientTempId)
      .filter((clientTempId): clientTempId is string => Boolean(clientTempId)),
  );

  const localOnlyMessages = existing.filter((message) => {
    if (!message.clientTempId) {
      return false;
    }

    if (message.clientTempId === excludeClientTempId) {
      return false;
    }

    if (latestIds.has(message.id)) {
      return false;
    }

    if (latestClientTempIds.has(message.clientTempId)) {
      return false;
    }

    return (
      message.outboundStatus === "pending" ||
      message.outboundStatus === "failed"
    );
  });

  return localOnlyMessages.length === 0
    ? latestPage
    : [...localOnlyMessages, ...latestPage];
}

function replaceOptimisticMessageWithConfirmed(
  existing: ConversationMessage[],
  clientTempId: string,
  confirmed: ConversationMessage,
): ConversationMessage[] {
  let wasReplaced = false;

  const next = existing.map((message) => {
    if (message.clientTempId !== clientTempId) {
      return message;
    }

    wasReplaced = true;

    return {
      ...confirmed,
      clientTempId: undefined,
      outboundStatus: undefined,
      sendError: undefined,
    };
  });

  return wasReplaced ? next : [confirmed, ...existing];
}

export class ConversationStore {
  conversations: Conversation[] = [];
  conversationListGroupFilterIds: number[] = [];
  conversationListSegment: ConversationListSegment = "all";
  conversationListKeyword = "";
  conversationListChannelIds: number[] = [];
  conversationListResponsibleUserIds: number[] = [];
  listCounters: ConversationListCounters = EMPTY_LIST_COUNTERS;
  messagesByConversationId: Record<string, ConversationMessage[]> = {};
  messagesPagingByConversationId: Record<string, MessagesPaging | undefined> =
    {};
  productSuggestionsByConversationId: Record<
    string,
    ConversationProductSuggestionsResponse | undefined
  > = {};

  listLoading = false;
  listError: string | null = null;

  messagesLoadingConversationId: string | null = null;
  messagesLoadingMoreConversationId: string | null = null;
  messagesError: string | null = null;
  productSuggestionsLoadingConversationId: string | null = null;
  productSuggestionsErrorByConversationId: Record<string, string | undefined> =
    {};

  _messageListMutationGeneration = new Map<string, number>();
  _messagesRequestIdByConversationId = new Map<string, number>();
  _messagesRequestSeq = 0;
  _productSuggestionsRequestIdByConversationId = new Map<string, number>();
  _productSuggestionsRequestSeq = 0;

  selfInstagramAccountId: string | null = null;
  selfTelegramAccountId: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      _messageListMutationGeneration: false,
      _messagesRequestIdByConversationId: false,
      _messagesRequestSeq: false,
      _productSuggestionsRequestIdByConversationId: false,
      _productSuggestionsRequestSeq: false,
    });
  }

  get sortedConversations(): Conversation[] {
    return sortConversationsByInstUpdatedAt(this.conversations);
  }

  get hasConversationListFilters(): boolean {
    return (
      this.conversationListChannelIds.length > 0 ||
      this.conversationListResponsibleUserIds.length > 0
    );
  }

  setSelfInstagramAccountId = (instagramAccountId: string | null): void => {
    this.selfInstagramAccountId = instagramAccountId;
  };

  setSelfTelegramAccountId = (telegramAccountId: string | null): void => {
    this.selfTelegramAccountId = telegramAccountId;
  };

  private get conversationSelfIds(): ConversationSelfIds {
    return {
      instagram: this.selfInstagramAccountId,
      telegram: this.selfTelegramAccountId,
    };
  }

  snapshotMessageListMutationGeneration = (conversationId: string): number => {
    return this._messageListMutationGeneration.get(conversationId) ?? 0;
  };

  bumpMessageListMutationGeneration = (conversationId: string): void => {
    this._messageListMutationGeneration.set(
      conversationId,
      (this._messageListMutationGeneration.get(conversationId) ?? 0) + 1,
    );
  };

  isStaleMessageListMutationGeneration = (
    conversationId: string,
    snapshot: number,
  ): boolean => {
    return (
      this.snapshotMessageListMutationGeneration(conversationId) !== snapshot
    );
  };

  createMessagesRequestId = (conversationId: string): number => {
    const requestId = this._messagesRequestSeq + 1;

    this._messagesRequestSeq = requestId;
    this._messagesRequestIdByConversationId.set(conversationId, requestId);

    return requestId;
  };

  isLatestMessagesRequest = (
    conversationId: string,
    requestId: number,
  ): boolean => {
    return (
      this._messagesRequestIdByConversationId.get(conversationId) === requestId
    );
  };

  createProductSuggestionsRequestId = (conversationId: string): number => {
    const requestId = this._productSuggestionsRequestSeq + 1;

    this._productSuggestionsRequestSeq = requestId;
    this._productSuggestionsRequestIdByConversationId.set(
      conversationId,
      requestId,
    );

    return requestId;
  };

  isLatestProductSuggestionsRequest = (
    conversationId: string,
    requestId: number,
  ): boolean => {
    return (
      this._productSuggestionsRequestIdByConversationId.get(conversationId) ===
      requestId
    );
  };

  clearConversationListError = (): void => {
    runInAction(() => {
      this.listError = null;
    });
  };

  setConversationListGroupFilterIds = (ids: number[]): void => {
    const normalized = normalizeListGroupFilterIds(ids);

    if (sameSortedNumberList(this.conversationListGroupFilterIds, normalized)) {
      return;
    }

    runInAction(() => {
      this.conversationListGroupFilterIds = normalized;
    });

    void this.loadConversations();
  };

  setConversationListSegment = (segment: ConversationListSegment): void => {
    if (this.conversationListSegment === segment) {
      return;
    }

    runInAction(() => {
      this.conversationListSegment = segment;
    });

    void this.loadConversations();
  };

  setConversationListKeyword = (keyword: string): void => {
    const normalized = keyword.trim();

    if (this.conversationListKeyword === normalized) {
      return;
    }

    runInAction(() => {
      this.conversationListKeyword = normalized;
    });

    void this.loadConversations();
  };

  setConversationListChannelIds = (ids: number[]): void => {
    const normalized = normalizeListGroupFilterIds(ids);

    if (sameSortedNumberList(this.conversationListChannelIds, normalized)) {
      return;
    }

    runInAction(() => {
      this.conversationListChannelIds = normalized;
    });

    void this.loadConversations();
  };

  setConversationListResponsibleUserIds = (ids: number[]): void => {
    const normalized = normalizeListGroupFilterIds(ids);

    if (
      sameSortedNumberList(this.conversationListResponsibleUserIds, normalized)
    ) {
      return;
    }

    runInAction(() => {
      this.conversationListResponsibleUserIds = normalized;
    });

    void this.loadConversations();
  };

  applyConversationListFilters = (filters: ConversationListFilters): void => {
    const channelIds = normalizeListGroupFilterIds(filters.channelIds ?? []);
    const responsibleUserIds = normalizeListGroupFilterIds(
      filters.responsibleUserIds ?? [],
    );

    if (
      sameSortedNumberList(this.conversationListChannelIds, channelIds) &&
      sameSortedNumberList(
        this.conversationListResponsibleUserIds,
        responsibleUserIds,
      )
    ) {
      return;
    }

    runInAction(() => {
      this.conversationListChannelIds = channelIds;
      this.conversationListResponsibleUserIds = responsibleUserIds;
    });

    void this.loadConversations();
  };

  private buildListParams = (): ListConversationsParams | undefined => {
    const params: ListConversationsParams = {};

    if (this.conversationListGroupFilterIds.length > 0) {
      params.groupIds = this.conversationListGroupFilterIds;
    }

    if (this.conversationListChannelIds.length > 0) {
      params.channelIds = this.conversationListChannelIds;
    }

    if (this.conversationListResponsibleUserIds.length > 0) {
      params.responsibleUserIds = this.conversationListResponsibleUserIds;
    }

    if (this.conversationListKeyword) {
      params.keyword = this.conversationListKeyword;
    }

    if (this.conversationListSegment === "unread") {
      params.unreadOnly = true;
    }

    if (this.conversationListSegment === "withoutResponsible") {
      params.showWithoutResponsibleOnly = true;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  };

  loadConversations = async (): Promise<void> => {
    runInAction(() => {
      this.listLoading = true;
      this.listError = null;
    });

    try {
      const { conversations, counters } = await conversationsApi.list(
        this.buildListParams(),
      );
      runInAction(() => {
        this.conversations = sortConversationsByInstUpdatedAt(conversations);
        this.listCounters = counters;
      });
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
      });
      throwLoadError("Failed to load conversations", e);
    } finally {
      runInAction(() => {
        this.listLoading = false;
      });
    }
  };

  loadConversationMessages = (conversationId: string): Promise<void> => {
    const mutationGenerationAtFetch =
      this.snapshotMessageListMutationGeneration(conversationId);
    const requestId = this.createMessagesRequestId(conversationId);

    runInAction(() => {
      this.messagesLoadingConversationId = conversationId;
      this.messagesError = null;
    });

    return conversationsApi
      .getMessages(conversationId, { page: 1 })
      .then(({ messages, paging }) => {
        if (!this.isLatestMessagesRequest(conversationId, requestId)) {
          return;
        }

        if (
          this.isStaleMessageListMutationGeneration(
            conversationId,
            mutationGenerationAtFetch,
          )
        ) {
          return;
        }

        runInAction(() => {
          const existing = this.messagesByConversationId[conversationId] ?? [];

          this.messagesByConversationId = {
            ...this.messagesByConversationId,
            [conversationId]: mergeLatestPagePreservingLocalOutboundMessages(
              existing,
              messages,
            ),
          };

          this.messagesPagingByConversationId = {
            ...this.messagesPagingByConversationId,
            [conversationId]: paging,
          };
        });
      })
      .catch((e) => {
        if (!this.isLatestMessagesRequest(conversationId, requestId)) {
          return;
        }

        runInAction(() => {
          this.messagesError = unknownErrorMessage(e);
        });
        throwLoadError(
          `Failed to load messages for conversation ${conversationId}`,
          e,
        );
      })
      .finally(() => {
        runInAction(() => {
          if (this.messagesLoadingConversationId === conversationId) {
            this.messagesLoadingConversationId = null;
          }
        });
      })
      .then(() => undefined);
  };

  loadConversationProductSuggestions = (
    conversationId: string,
  ): Promise<void> => {
    const requestId = this.createProductSuggestionsRequestId(conversationId);

    runInAction(() => {
      this.productSuggestionsLoadingConversationId = conversationId;
      this.productSuggestionsErrorByConversationId = {
        ...this.productSuggestionsErrorByConversationId,
        [conversationId]: undefined,
      };
    });

    return conversationsApi
      .getProductSuggestions(conversationId)
      .then((suggestions) => {
        if (
          !this.isLatestProductSuggestionsRequest(conversationId, requestId)
        ) {
          return;
        }

        runInAction(() => {
          this.productSuggestionsByConversationId = {
            ...this.productSuggestionsByConversationId,
            [conversationId]: suggestions,
          };
        });
      })
      .catch((e) => {
        if (
          !this.isLatestProductSuggestionsRequest(conversationId, requestId)
        ) {
          return;
        }

        runInAction(() => {
          this.productSuggestionsErrorByConversationId = {
            ...this.productSuggestionsErrorByConversationId,
            [conversationId]: unknownErrorMessage(e),
          };
        });
        console.error(
          `Failed to load product suggestions for conversation ${conversationId}:`,
          e,
        );
      })
      .finally(() => {
        runInAction(() => {
          if (this.productSuggestionsLoadingConversationId === conversationId) {
            this.productSuggestionsLoadingConversationId = null;
          }
        });
      })
      .then(() => undefined);
  };

  loadOlderConversationMessages = (conversationId: string): Promise<void> => {
    const paging = this.messagesPagingByConversationId[conversationId];

    if (!paging?.has_next) {
      return Promise.resolve();
    }

    const currentPage = paging.page ?? 1;
    const nextPage = currentPage + 1;
    const pageSize = paging.page_size ?? 50;

    let started = false;

    runInAction(() => {
      if (
        this.messagesLoadingMoreConversationId === conversationId ||
        this.messagesLoadingConversationId === conversationId
      ) {
        return;
      }

      this.messagesLoadingMoreConversationId = conversationId;
      this.messagesError = null;
      started = true;
    });

    if (!started) {
      return Promise.resolve();
    }

    return conversationsApi
      .getMessages(conversationId, { page: nextPage, page_size: pageSize })
      .then(({ messages, paging: nextPaging }) => {
        runInAction(() => {
          const existing = this.messagesByConversationId[conversationId] ?? [];

          this.messagesByConversationId = {
            ...this.messagesByConversationId,
            [conversationId]: appendOlderMessageBatch(existing, messages),
          };

          this.messagesPagingByConversationId = {
            ...this.messagesPagingByConversationId,
            [conversationId]: nextPaging,
          };
        });

        this.bumpMessageListMutationGeneration(conversationId);
      })
      .catch((e) => {
        runInAction(() => {
          this.messagesError = unknownErrorMessage(e);
        });
        throwLoadError(
          `Failed to load older messages for conversation ${conversationId}`,
          e,
        );
      })
      .finally(() => {
        runInAction(() => {
          if (this.messagesLoadingMoreConversationId === conversationId) {
            this.messagesLoadingMoreConversationId = null;
          }
        });
      })
      .then(() => undefined);
  };

  sendConversationMessage = (
    conversationId: string,
    payload: SendMessagePayload,
    sentBy?: MessageParticipant,
  ): Promise<void> => {
    const clientTempId = createClientTempId();
    const optimistic = createOptimisticOutboundMessage(
      payload,
      sentBy,
      clientTempId,
    );

    runInAction(() => {
      const existing = this.messagesByConversationId[conversationId] ?? [];

      this.messagesByConversationId = {
        ...this.messagesByConversationId,
        [conversationId]: [optimistic, ...existing],
      };
    });

    this.bumpMessageListMutationGeneration(conversationId);

    return this.dispatchOutboundSend(
      conversationId,
      clientTempId,
      payload,
      sentBy,
    );
  };

  resendOutboundMessage = (
    conversationId: string,
    clientTempId: string,
    sentBy?: MessageParticipant,
  ): Promise<void> => {
    const list = this.messagesByConversationId[conversationId] ?? [];
    const message = list.find(
      (m) => m.clientTempId === clientTempId && m.outboundStatus === "failed",
    );

    if (!message) {
      return Promise.resolve();
    }

    const payload: SendMessagePayload = {
      message: message.message,
      ...(message.reply_to_id != null && message.reply_to_id !== ""
        ? { reply_to_id: message.reply_to_id }
        : {}),
    };

    runInAction(() => {
      this.messagesByConversationId = {
        ...this.messagesByConversationId,
        [conversationId]: list.map((m) =>
          m.clientTempId === clientTempId
            ? {
                ...m,
                outboundStatus: "pending",
                sendError: undefined,
              }
            : m,
        ),
      };
    });

    this.bumpMessageListMutationGeneration(conversationId);

    return this.dispatchOutboundSend(
      conversationId,
      clientTempId,
      payload,
      sentBy,
    );
  };

  dispatchOutboundSend = (
    conversationId: string,
    clientTempId: string,
    payload: SendMessagePayload,
    sentBy?: MessageParticipant,
  ): Promise<void> => {
    return conversationsApi
      .sendMessage(conversationId, payload)
      .then((raw) => {
        // TEMPORARY: POST does not return the full message object — we update the list via GET (page 1).
        // Remove this extra GET after API starts returning a full message object.
        return conversationsApi
          .getMessages(conversationId, { page: 1 })
          .then(({ messages, paging }) => {
            const merged = mergeLatestMessagesPageWithSendResult(
              messages,
              raw,
              payload,
              sentBy,
            );

            runInAction(() => {
              const existing =
                this.messagesByConversationId[conversationId] ?? [];

              this.messagesByConversationId = {
                ...this.messagesByConversationId,
                [conversationId]:
                  mergeLatestPagePreservingLocalOutboundMessages(
                    existing,
                    merged,
                    clientTempId,
                  ),
              };

              this.messagesPagingByConversationId = {
                ...this.messagesPagingByConversationId,
                [conversationId]: paging,
              };
            });

            this.bumpMessageListMutationGeneration(conversationId);
          })
          .catch(() => {
            const confirmed = normalizeSentMessage(raw, payload, sentBy);

            runInAction(() => {
              const existing =
                this.messagesByConversationId[conversationId] ?? [];

              this.messagesByConversationId = {
                ...this.messagesByConversationId,
                [conversationId]: replaceOptimisticMessageWithConfirmed(
                  existing,
                  clientTempId,
                  confirmed,
                ),
              };
            });

            this.bumpMessageListMutationGeneration(conversationId);
          });
      })
      .catch((e) => {
        runInAction(() => {
          const existing = this.messagesByConversationId[conversationId] ?? [];

          this.messagesByConversationId = {
            ...this.messagesByConversationId,
            [conversationId]: existing.map((m) =>
              m.clientTempId === clientTempId
                ? {
                    ...m,
                    outboundStatus: "failed",
                    sendError: unknownErrorMessage(e),
                  }
                : m,
            ),
          };
        });

        this.bumpMessageListMutationGeneration(conversationId);
      })
      .then(() => undefined);
  };

  async updateConversationGroup(
    conversationId: string,
    groupId: number | null,
  ): Promise<void> {
    const raw = await conversationsApi.update(conversationId, { groupId });

    runInAction(() => {
      this.conversations = sortConversationsByInstUpdatedAt(
        this.conversations.map((c) => {
          if (String(c.id) !== conversationId) {
            return c;
          }

          if (raw && typeof raw === "object" && "id" in raw) {
            return raw;
          }

          return { ...c, groupId };
        }),
      );
    });
  }

  async updateConversationAssignee(
    conversationId: string,
    responsibleMemberId: number | null,
    assignee: Conversation["assignee"],
  ): Promise<void> {
    const raw = await conversationsApi.update(conversationId, {
      responsible_member_id: responsibleMemberId,
    });

    runInAction(() => {
      this.conversations = sortConversationsByInstUpdatedAt(
        this.conversations.map((c) => {
          if (String(c.id) !== conversationId) {
            return c;
          }

          if (raw && typeof raw === "object" && "id" in raw) {
            return raw;
          }

          return { ...c, responsibleMemberId, assignee };
        }),
      );
    });
  }

  private matchesListGroupFilter = (conversation: Conversation): boolean => {
    if (this.conversationListGroupFilterIds.length === 0) {
      return true;
    }

    return (
      conversation.groupId != null &&
      this.conversationListGroupFilterIds.includes(conversation.groupId)
    );
  };

  upsertConversation = (conversation: Conversation): void => {
    const index = this.conversations.findIndex(
      (item) => item.id === conversation.id,
    );

    if (index >= 0) {
      const next = [...this.conversations];
      next[index] = { ...next[index], ...conversation };
      this.conversations = sortConversationsByInstUpdatedAt(next);
      return;
    }

    if (this.matchesListGroupFilter(conversation)) {
      this.conversations = sortConversationsByInstUpdatedAt([
        ...this.conversations,
        conversation,
      ]);
    }
  };

  upsertMessage = (
    conversationId: string,
    dto: InstagramMessageDto,
  ): { isNew: boolean; isFromParticipant: boolean } => {
    const normalized = normalizeInstagramMessage(dto);
    const existing = this.messagesByConversationId[conversationId] ?? [];
    const isNew = isNewConversationMessage(existing, normalized.id);
    const conversation = this.conversations.find(
      (item) => String(item.id) === conversationId,
    );
    const selfAccountId = resolveSelfAccountIdForMessage(
      normalized,
      this.conversationSelfIds,
      conversation?.participant.id,
    );
    const isFromParticipant =
      conversation?.channel === "telegram" &&
      conversation.participant.id != null &&
      normalized.from?.id != null
        ? String(normalized.from.id) === String(conversation.participant.id)
        : selfAccountId != null &&
          normalized.from?.id != null &&
          String(normalized.from.id) !== selfAccountId;

    this.messagesByConversationId = {
      ...this.messagesByConversationId,
      [conversationId]: upsertConversationMessage(existing, normalized),
    };

    this.bumpMessageListMutationGeneration(conversationId);

    return { isNew, isFromParticipant };
  };

  applyRealtimeUpdate = (payload: ConversationsUpdatePayload): void => {
    let shouldPlaySound = false;

    runInAction(() => {
      if (payload.conversation) {
        this.upsertConversation(payload.conversation);
      }

      if (payload.message) {
        const { isNew, isFromParticipant } = this.upsertMessage(
          String(payload.conversationId),
          payload.message,
        );

        shouldPlaySound = isNew && isFromParticipant;
      }
    });

    if (shouldPlaySound) {
      playNewMessageNotification();
    }
  };
}
