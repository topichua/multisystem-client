import { apiClient } from "@/api/api-client";
import {
  parseInstagramMediaPageResponse,
  parseInstagramIntegrationsResponse,
  parseInstagramProductReferencesResponse,
} from "@/features/instagram/model/instagram-parsers";
import type {
  InstagramIntegration,
  InstagramIntegrationId,
  InstagramMediaPage,
  InstagramPostAiExtractionResponse,
  InstagramPostProductVariantsResponse,
  InstagramProductReferences,
} from "@/features/instagram/model/instagram.types";

const basePath = "/api/instagram";
export const INSTAGRAM_MEDIA_PAGE_SIZE = 5;

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

export const instagramApi = {
  listIntegrations: async (): Promise<InstagramIntegration[]> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/integrations`);

    return parseInstagramIntegrationsResponse(data);
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
};
