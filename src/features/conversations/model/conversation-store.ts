import { makeAutoObservable, runInAction } from "mobx";

import {
  conversationsApi,
  createOptimisticOutboundMessage,
  mergeLatestMessagesPageWithSendResult,
  normalizeSentMessage,
  type ConversationGroupBucket,
  type ConversationGroupingBy,
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
  ConversationFollowUp,
  ConversationFollowUpWritePayload,
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
  [...new Set(ids)].filter((id) => Number.isInteger(id)).sort((a, b) => a - b);

const sameSortedNumberList = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((id, i) => id === b[i]);

const normalizeExpandedGroupingKeys = (
  keys: string[],
  allowedKeys: string[],
): string[] => {
  const allowed = new Set(allowedKeys);
  const result: string[] = [];

  keys.forEach((key) => {
    if (allowed.has(key) && !result.includes(key)) {
      result.push(key);
    }
  });

  return result;
};

const sameStringList = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((key, i) => key === b[i]);

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
  conversationGroupingBy: ConversationGroupingBy | null = null;
  conversationGroupingBuckets: ConversationGroupBucket[] = [];
  expandedConversationGroupingKeys: string[] = [];
  groupedConversationsByKey: Record<string, Conversation[]> = {};
  groupedConversationsLoadingByKey: Record<string, boolean | undefined> = {};
  groupedConversationsErrorByKey: Record<string, string | undefined> = {};
  listCounters: ConversationListCounters = EMPTY_LIST_COUNTERS;
  messagesByConversationId: Record<string, ConversationMessage[]> = {};
  messagesPagingByConversationId: Record<string, MessagesPaging | undefined> =
    {};
  productSuggestionsByConversationId: Record<
    string,
    ConversationProductSuggestionsResponse | undefined
  > = {};

  listLoading = false;
  listLoaded = false;
  listError: string | null = null;
  conversationGroupingBucketsLoading = false;
  conversationGroupingBucketsError: string | null = null;

  messagesLoadingConversationId: string | null = null;
  messagesLoadingMoreConversationId: string | null = null;
  messagesError: string | null = null;
  productSuggestionsLoadingConversationId: string | null = null;
  productSuggestionsErrorByConversationId: Record<string, string | undefined> =
    {};

  _messageListMutationGeneration = new Map<string, number>();
  _messagesRequestIdByConversationId = new Map<string, number>();
  _messagesRequestSeq = 0;
  _conversationGroupingBucketsRequestSeq = 0;
  _conversationGroupingBucketsRequestId = 0;
  _groupedConversationsRequestIdByKey = new Map<string, number>();
  _groupedConversationsRequestSeq = 0;
  _conversationGroupingExpansionInitialized = false;
  _productSuggestionsRequestIdByConversationId = new Map<string, number>();
  _productSuggestionsRequestSeq = 0;

  selfInstagramAccountId: string | null = null;
  selfTelegramAccountId: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      _messageListMutationGeneration: false,
      _messagesRequestIdByConversationId: false,
      _messagesRequestSeq: false,
      _conversationGroupingBucketsRequestSeq: false,
      _conversationGroupingBucketsRequestId: false,
      _groupedConversationsRequestIdByKey: false,
      _groupedConversationsRequestSeq: false,
      _conversationGroupingExpansionInitialized: false,
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

  get visibleConversationGroupingBuckets(): ConversationGroupBucket[] {
    return this.filterConversationGroupingBucketsForCurrentGroupFilter(
      this.conversationGroupingBuckets,
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

  private clearConversationGroupingData = (): void => {
    this.conversationGroupingBuckets = [];
    this.expandedConversationGroupingKeys = [];
    this.groupedConversationsByKey = {};
    this.groupedConversationsLoadingByKey = {};
    this.groupedConversationsErrorByKey = {};
    this.conversationGroupingBucketsLoading = false;
    this.conversationGroupingBucketsError = null;
    this._conversationGroupingBucketsRequestId = 0;
    this._groupedConversationsRequestIdByKey.clear();
    this._conversationGroupingExpansionInitialized = false;
  };

  private clearGroupedConversations = (): void => {
    this.groupedConversationsByKey = {};
    this.groupedConversationsLoadingByKey = {};
    this.groupedConversationsErrorByKey = {};
    this._groupedConversationsRequestIdByKey.clear();
  };

  private refreshGroupedConversationsAfterListParamsChange = (): void => {
    if (this.conversationGroupingBy == null) {
      return;
    }

    runInAction(() => {
      this.clearGroupedConversations();
    });

    void this.loadConversationGroupingBuckets(this.conversationGroupingBy);
  };

  private reloadConversationsAfterListParamsChange = (): void => {
    void this.loadConversations();
    this.refreshGroupedConversationsAfterListParamsChange();
  };

  private filterConversationGroupingBucketsForCurrentGroupFilter = (
    buckets: ConversationGroupBucket[],
  ): ConversationGroupBucket[] => {
    if (
      this.conversationGroupingBy !== "status" ||
      this.conversationListGroupFilterIds.length === 0
    ) {
      return buckets;
    }

    const selectedGroupIds = new Set(this.conversationListGroupFilterIds);

    return buckets.filter(
      (bucket) =>
        bucket.meta.groupId != null &&
        selectedGroupIds.has(bucket.meta.groupId),
    );
  };

  private createConversationGroupingBucketsRequestId = (): number => {
    const requestId = this._conversationGroupingBucketsRequestSeq + 1;

    this._conversationGroupingBucketsRequestSeq = requestId;
    this._conversationGroupingBucketsRequestId = requestId;

    return requestId;
  };

  private isLatestConversationGroupingBucketsRequest = (
    requestId: number,
  ): boolean => this._conversationGroupingBucketsRequestId === requestId;

  private createGroupedConversationsRequestId = (
    groupingKey: string,
  ): number => {
    const requestId = this._groupedConversationsRequestSeq + 1;

    this._groupedConversationsRequestSeq = requestId;
    this._groupedConversationsRequestIdByKey.set(groupingKey, requestId);

    return requestId;
  };

  private isLatestGroupedConversationsRequest = (
    groupingKey: string,
    requestId: number,
  ): boolean =>
    this._groupedConversationsRequestIdByKey.get(groupingKey) === requestId;

  setConversationListGroupFilterIds = (ids: number[]): void => {
    const normalized = normalizeListGroupFilterIds(ids);

    if (sameSortedNumberList(this.conversationListGroupFilterIds, normalized)) {
      return;
    }

    runInAction(() => {
      this.conversationListGroupFilterIds = normalized;
      if (this.conversationGroupingBy != null) {
        this._conversationGroupingExpansionInitialized = false;
      }
    });

    this.reloadConversationsAfterListParamsChange();
  };

  setConversationListSegment = (segment: ConversationListSegment): void => {
    if (this.conversationListSegment === segment) {
      return;
    }

    runInAction(() => {
      this.conversationListSegment = segment;
    });

    this.reloadConversationsAfterListParamsChange();
  };

  setConversationListKeyword = (keyword: string): void => {
    const normalized = keyword.trim();

    if (this.conversationListKeyword === normalized) {
      return;
    }

    runInAction(() => {
      this.conversationListKeyword = normalized;
    });

    this.reloadConversationsAfterListParamsChange();
  };

  setConversationListChannelIds = (ids: number[]): void => {
    const normalized = normalizeListGroupFilterIds(ids);

    if (sameSortedNumberList(this.conversationListChannelIds, normalized)) {
      return;
    }

    runInAction(() => {
      this.conversationListChannelIds = normalized;
    });

    this.reloadConversationsAfterListParamsChange();
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

    this.reloadConversationsAfterListParamsChange();
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

    this.reloadConversationsAfterListParamsChange();
  };

  setConversationGroupingBy = (
    groupingBy: ConversationGroupingBy | null,
  ): void => {
    if (this.conversationGroupingBy === groupingBy) {
      return;
    }

    runInAction(() => {
      this.conversationGroupingBy = groupingBy;
      this.clearConversationGroupingData();
    });

    void this.loadConversations();

    if (groupingBy != null) {
      void this.loadConversationGroupingBuckets(groupingBy);
    }
  };

  setExpandedConversationGroupingKeys = (keys: string[]): void => {
    const bucketKeys = this.conversationGroupingBuckets.map(
      (bucket) => bucket.key,
    );
    const normalized = normalizeExpandedGroupingKeys(keys, bucketKeys);

    if (sameStringList(this.expandedConversationGroupingKeys, normalized)) {
      return;
    }

    runInAction(() => {
      this.expandedConversationGroupingKeys = normalized;
      this._conversationGroupingExpansionInitialized = true;
    });

    normalized.forEach((key) => {
      void this.loadConversationGroupingBucketConversations(key);
    });
  };

  loadConversationGroupingBuckets = async (
    groupingBy: ConversationGroupingBy,
  ): Promise<void> => {
    const requestId = this.createConversationGroupingBucketsRequestId();

    runInAction(() => {
      this.conversationGroupingBucketsLoading = true;
      this.conversationGroupingBucketsError = null;
    });

    try {
      const result = await conversationsApi.groups(groupingBy);

      if (
        !this.isLatestConversationGroupingBucketsRequest(requestId) ||
        this.conversationGroupingBy !== groupingBy
      ) {
        return;
      }

      const visibleBuckets =
        this.filterConversationGroupingBucketsForCurrentGroupFilter(
          result.items,
        );
      const bucketKeys = visibleBuckets.map((bucket) => bucket.key);
      const expandedKeys = this._conversationGroupingExpansionInitialized
        ? normalizeExpandedGroupingKeys(
            this.expandedConversationGroupingKeys,
            bucketKeys,
          )
        : bucketKeys;

      runInAction(() => {
        this.conversationGroupingBuckets = result.items;
        this.expandedConversationGroupingKeys = expandedKeys;
        this._conversationGroupingExpansionInitialized = true;
      });

      expandedKeys.forEach((key) => {
        void this.loadConversationGroupingBucketConversations(key);
      });
    } catch (e) {
      if (
        !this.isLatestConversationGroupingBucketsRequest(requestId) ||
        this.conversationGroupingBy !== groupingBy
      ) {
        return;
      }

      runInAction(() => {
        this.conversationGroupingBuckets = [];
        this.expandedConversationGroupingKeys = [];
        this.conversationGroupingBucketsError = unknownErrorMessage(e);
      });
      console.error(`Failed to load conversation groups by ${groupingBy}:`, e);
    } finally {
      if (this.isLatestConversationGroupingBucketsRequest(requestId)) {
        runInAction(() => {
          this.conversationGroupingBucketsLoading = false;
        });
      }
    }
  };

  loadConversationGroupingBucketConversations = async (
    groupingId: string,
  ): Promise<void> => {
    const groupingBy = this.conversationGroupingBy;

    if (groupingBy == null) {
      return;
    }

    if (this.groupedConversationsByKey[groupingId] != null) {
      return;
    }

    const requestId = this.createGroupedConversationsRequestId(groupingId);

    runInAction(() => {
      this.groupedConversationsLoadingByKey = {
        ...this.groupedConversationsLoadingByKey,
        [groupingId]: true,
      };
      this.groupedConversationsErrorByKey = {
        ...this.groupedConversationsErrorByKey,
        [groupingId]: undefined,
      };
    });

    try {
      const { conversations } = await conversationsApi.list(
        this.buildGroupingListParams(groupingBy, groupingId),
      );

      if (
        !this.isLatestGroupedConversationsRequest(groupingId, requestId) ||
        this.conversationGroupingBy !== groupingBy
      ) {
        return;
      }

      runInAction(() => {
        this.groupedConversationsByKey = {
          ...this.groupedConversationsByKey,
          [groupingId]: sortConversationsByInstUpdatedAt(conversations),
        };
      });
    } catch (e) {
      if (!this.isLatestGroupedConversationsRequest(groupingId, requestId)) {
        return;
      }

      runInAction(() => {
        this.groupedConversationsErrorByKey = {
          ...this.groupedConversationsErrorByKey,
          [groupingId]: unknownErrorMessage(e),
        };
      });
      console.error(
        `Failed to load conversations for ${groupingBy} group ${groupingId}:`,
        e,
      );
    } finally {
      if (this.isLatestGroupedConversationsRequest(groupingId, requestId)) {
        runInAction(() => {
          this.groupedConversationsLoadingByKey = {
            ...this.groupedConversationsLoadingByKey,
            [groupingId]: false,
          };
        });
      }
    }
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

  private buildGroupingListParams = (
    groupingBy: ConversationGroupingBy,
    groupingId: string,
  ): ListConversationsParams => {
    const params: ListConversationsParams = {
      ...(this.buildListParams() ?? {}),
      groupingBy,
      groupingId,
    };

    return params;
  };

  loadConversations = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const { conversations, counters } = await conversationsApi.list(
        this.buildListParams(),
      );
      runInAction(() => {
        this.conversations = sortConversationsByInstUpdatedAt(conversations);
        this.listCounters = counters;
        this.listLoaded = true;

        if (!silent) {
          this.listLoading = false;
        }
      });
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
      });
      throwLoadError("Failed to load conversations", e);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
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

  private setConversationFollowUp = (
    conversationId: string,
    followUp: ConversationFollowUp | null,
  ): void => {
    const patch = (conversation: Conversation): Conversation =>
      String(conversation.id) === conversationId
        ? { ...conversation, followUp }
        : conversation;

    this.conversations = this.conversations.map(patch);
    this.groupedConversationsByKey = Object.fromEntries(
      Object.entries(this.groupedConversationsByKey).map(([key, items]) => [
        key,
        items.map(patch),
      ]),
    );
  };

  saveConversationFollowUp = async (
    conversationId: string,
    payload: ConversationFollowUpWritePayload,
    isEditing: boolean,
  ): Promise<ConversationFollowUp> => {
    const followUp = isEditing
      ? await conversationsApi.updateFollowUp(conversationId, payload)
      : await conversationsApi.createFollowUp(conversationId, payload);

    runInAction(() => {
      this.setConversationFollowUp(conversationId, followUp);
    });

    return followUp;
  };

  cancelConversationFollowUp = async (
    conversationId: string,
  ): Promise<void> => {
    await conversationsApi.deleteFollowUp(conversationId);

    runInAction(() => {
      this.setConversationFollowUp(conversationId, null);
    });
  };

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

  deleteConversation = async (
    conversationId: string | number,
  ): Promise<void> => {
    const id = String(conversationId);
    const existing = this.conversations.find((item) => String(item.id) === id);

    await conversationsApi.delete(id);

    runInAction(() => {
      this.conversations = this.conversations.filter(
        (item) => String(item.id) !== id,
      );

      const nextGrouped: Record<string, Conversation[]> = {};
      const decrementedGroupingKeys = new Set<string>();

      for (const [key, items] of Object.entries(
        this.groupedConversationsByKey,
      )) {
        const filtered = items.filter((item) => String(item.id) !== id);

        if (filtered.length !== items.length) {
          decrementedGroupingKeys.add(key);
        }

        nextGrouped[key] = filtered;
      }

      this.groupedConversationsByKey = nextGrouped;
      this.conversationGroupingBuckets = this.conversationGroupingBuckets.map(
        (bucket) =>
          decrementedGroupingKeys.has(bucket.key)
            ? { ...bucket, count: Math.max(0, bucket.count - 1) }
            : bucket,
      );

      const restMessages = { ...this.messagesByConversationId };
      delete restMessages[id];
      this.messagesByConversationId = restMessages;

      const restPaging = { ...this.messagesPagingByConversationId };
      delete restPaging[id];
      this.messagesPagingByConversationId = restPaging;

      const restSuggestions = { ...this.productSuggestionsByConversationId };
      delete restSuggestions[id];
      this.productSuggestionsByConversationId = restSuggestions;

      const restSuggestionsErrors = {
        ...this.productSuggestionsErrorByConversationId,
      };
      delete restSuggestionsErrors[id];
      this.productSuggestionsErrorByConversationId = restSuggestionsErrors;

      if (existing) {
        this.listCounters = {
          total: Math.max(0, this.listCounters.total - 1),
          unread: Math.max(
            0,
            this.listCounters.unread - (existing.unreadCount > 0 ? 1 : 0),
          ),
          withoutResponsible: Math.max(
            0,
            this.listCounters.withoutResponsible -
              (existing.responsibleMemberId == null ? 1 : 0),
          ),
        };
      }
    });
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
