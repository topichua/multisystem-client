import { apiClient } from "@/api/api-client";
import {
  parseInstagramCommentsPageResponse,
  parseInstagramMediaPageResponse,
  parseInstagramIntegrationsResponse,
  parseInstagramProductReferencesResponse,
} from "@/features/instagram/model/instagram-parsers";
import type {
  InstagramComment,
  InstagramCommentsPage,
  InstagramIntegration,
  InstagramIntegrationId,
  InstagramMediaPage,
  InstagramPostAiExtractionResponse,
  InstagramPostProductVariantsResponse,
  InstagramProductReferences,
} from "@/features/instagram/model/instagram.types";
import { hasActiveInstagramSynchronization } from "@/features/instagram/model/has-active-instagram-synchronization";

const basePath = "/api/instagram";
const INSTAGRAM_MEDIA_PAGE_SIZE = 5;

type ListMediaParams = {
  integrationId: InstagramIntegrationId;
  limit?: number;
  after?: string;
  before?: string;
};

type GetPostProductVariantsParams = {
  postId: string;
  integrationId: InstagramIntegrationId;
};

type GetPostAiExtractionParams = {
  postId: string;
  integrationId: InstagramIntegrationId;
};

type ListPostCommentsParams = {
  postId: string;
  integrationId: InstagramIntegrationId;
  limit?: number;
  after?: string;
  before?: string;
  includeReplies?: boolean;
};

type ListCommentRepliesParams = {
  postId: string;
  commentId: string;
  integrationId: InstagramIntegrationId;
  limit?: number;
  after?: string;
  before?: string;
};

type ReplyToCommentParams = {
  postId: string;
  commentId: string;
  integrationId: InstagramIntegrationId;
  message: string;
};

export const instagramApi = {
  listIntegrations: async (): Promise<InstagramIntegration[]> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/integrations`);

    return parseInstagramIntegrationsResponse(data);
  },

  getActiveSynchronizations: async (): Promise<boolean> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/synchronizations/active`,
    );

    return hasActiveInstagramSynchronization(data);
  },

  listMedia: async ({
    integrationId,
    limit = INSTAGRAM_MEDIA_PAGE_SIZE,
    after,
    before,
  }: ListMediaParams): Promise<InstagramMediaPage> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/media`, {
      params: {
        integrationId,
        limit,
        after,
        before,
      },
    });

    return parseInstagramMediaPageResponse(data);
  },

  listProductReferences: async (
    instagramAccountId: string,
  ): Promise<InstagramProductReferences> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/references/product-ids`,
      {
        params: {
          instagram_account_id: instagramAccountId,
        },
      },
    );

    return parseInstagramProductReferencesResponse(data);
  },

  getPostProductVariants: async ({
    postId,
    integrationId,
  }: GetPostProductVariantsParams): Promise<InstagramPostProductVariantsResponse> => {
    const { data } = await apiClient.get<InstagramPostProductVariantsResponse>(
      `${basePath}/posts/${encodeURIComponent(postId)}/product-variants`,
      {
        params: {
          integrationId,
        },
      },
    );

    return data;
  },

  getPostAiExtraction: async ({
    postId,
    integrationId,
  }: GetPostAiExtractionParams): Promise<InstagramPostAiExtractionResponse> => {
    const { data } = await apiClient.get<InstagramPostAiExtractionResponse>(
      `${basePath}/posts/${encodeURIComponent(postId)}/ai-extraction`,
      {
        params: {
          integrationId,
        },
      },
    );

    return data;
  },

  listPostComments: async ({
    postId,
    integrationId,
    limit,
    after,
    before,
    includeReplies,
  }: ListPostCommentsParams): Promise<InstagramCommentsPage> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/posts/${encodeURIComponent(postId)}/comments`,
      {
        params: {
          integrationId,
          limit,
          after,
          before,
          include_replies: includeReplies,
        },
      },
    );

    return parseInstagramCommentsPageResponse(data);
  },

  listCommentReplies: async ({
    postId,
    commentId,
    integrationId,
    limit,
    after,
    before,
  }: ListCommentRepliesParams): Promise<InstagramCommentsPage> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/replies`,
      {
        params: {
          integrationId,
          limit,
          after,
          before,
        },
      },
    );

    return parseInstagramCommentsPageResponse(data);
  },

  replyToComment: async ({
    postId,
    commentId,
    integrationId,
    message,
  }: ReplyToCommentParams): Promise<InstagramComment | null> => {
    const { data } = await apiClient.post<unknown>(
      `${basePath}/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/reply`,
      { message },
      {
        params: {
          integrationId,
        },
      },
    );

    return (
      parseInstagramCommentsPageResponse(data).comments[0] ??
      parseInstagramCommentsPageResponse({ data: [data] }).comments[0] ??
      null
    );
  },
};
