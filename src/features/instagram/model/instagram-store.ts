import { makeAutoObservable, runInAction } from "mobx";

import { instagramApi } from "@/features/instagram/api/instagram-api";
import { productsApi } from "@/features/products/api/products-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import { getInstagramMediaPagingCursor } from "./instagram-parsers";
import type {
  InstagramComment,
  InstagramCommentsPage,
  InstagramIntegration,
  InstagramIntegrationId,
  InstagramMediaFilter,
  InstagramMediaItem,
  InstagramMediaPaging,
  InstagramPostAiExtractionResponse,
  InstagramPostDetails,
  InstagramPostProductVariantsResponse,
} from "./instagram.types";

export class InstagramStore {
  integrations: InstagramIntegration[] = [];
  selectedIntegrationId: InstagramIntegrationId | null = null;

  listLoading = false;
  listLoaded = false;
  listError: string | null = null;

  mediaItems: InstagramMediaItem[] = [];
  mediaPaging: InstagramMediaPaging | null = null;
  mediaLoading = false;
  mediaLoaded = false;
  mediaError: string | null = null;

  productReferenceMediaIds: string[] = [];
  private productReferenceMediaIdSet = new Set<string>();
  productIdsByMediaId = new Map<string, string[]>();
  productReferencesError: string | null = null;

  postCommentsByPostId = new Map<string, InstagramComment[]>();
  postCommentsPagingByPostId = new Map<string, InstagramMediaPaging | null>();
  postCommentsLoadingPostId: string | null = null;
  postCommentsErrorByPostId = new Map<string, string>();
  commentRepliesByCommentId = new Map<string, InstagramComment[]>();
  commentRepliesPagingByCommentId = new Map<
    string,
    InstagramMediaPaging | null
  >();
  commentRepliesLoadingCommentId: string | null = null;
  commentRepliesErrorByCommentId = new Map<string, string>();
  commentReplySendingCommentId: string | null = null;

  selectedPostDetails: InstagramPostDetails | null = null;
  postProductVariantsLoadingId: string | null = null;
  postProductVariantsError: string | null = null;
  postAiExtractionLoadingId: string | null = null;
  postAiExtractionError: string | null = null;
  postAiExtractionResult: InstagramPostAiExtractionResponse | null = null;
  linkProductLoading = false;
  unlinkProductReferenceId: InstagramIntegrationId | null = null;

  mediaFilter: InstagramMediaFilter = "all";

  private mediaRequestSeq = 0;
  private productReferencesRequestSeq = 0;
  private postProductVariantsRequestSeq = 0;
  private postAiExtractionRequestSeq = 0;
  private postCommentsRequestSeqByPostId = new Map<string, number>();
  private commentRepliesRequestSeqByCommentId = new Map<string, number>();

  constructor() {
    makeAutoObservable(this);
  }

  get selectedIntegration(): InstagramIntegration | null {
    if (this.selectedIntegrationId == null) {
      return null;
    }

    return (
      this.integrations.find(
        (item) =>
          String(item.integration_id) === String(this.selectedIntegrationId),
      ) ?? null
    );
  }

  get linkedMediaCount(): number {
    return this.mediaItems.filter((item) => this.hasProductReference(item.id))
      .length;
  }

  get withoutProductMediaCount(): number {
    return this.mediaItems.length - this.linkedMediaCount;
  }

  get visibleMediaItems(): InstagramMediaItem[] {
    switch (this.mediaFilter) {
      case "linked":
        return this.mediaItems.filter((item) =>
          this.hasProductReference(item.id),
        );

      case "without-product":
        return this.mediaItems.filter(
          (item) => !this.hasProductReference(item.id),
        );

      default:
        return this.mediaItems;
    }
  }

  get canLoadNextMediaPage(): boolean {
    return (
      this.mediaPaging?.has_next !== false &&
      getInstagramMediaPagingCursor(this.mediaPaging, "next") != null
    );
  }

  get mediaLoadingMore(): boolean {
    return this.mediaLoading && this.mediaLoaded;
  }

  getPostComments = (postId: string): InstagramComment[] =>
    this.postCommentsByPostId.get(postId) ?? [];

  getPostCommentsPaging = (postId: string): InstagramMediaPaging | null =>
    this.postCommentsPagingByPostId.get(postId) ?? null;

  getPostCommentsError = (postId: string): string | null =>
    this.postCommentsErrorByPostId.get(postId) ?? null;

  isPostCommentsLoading = (postId: string): boolean =>
    this.postCommentsLoadingPostId === postId;

  isPostCommentsLoadingMore = (postId: string): boolean =>
    this.isPostCommentsLoading(postId) && this.postCommentsByPostId.has(postId);

  canLoadNextPostCommentsPage = (postId: string): boolean => {
    const paging = this.getPostCommentsPaging(postId);

    return (
      paging?.has_next !== false &&
      getInstagramMediaPagingCursor(paging, "next") != null
    );
  };

  getCommentReplies = (commentId: string): InstagramComment[] =>
    this.commentRepliesByCommentId.get(commentId) ?? [];

  getCommentRepliesPaging = (commentId: string): InstagramMediaPaging | null =>
    this.commentRepliesPagingByCommentId.get(commentId) ?? null;

  getCommentRepliesError = (commentId: string): string | null =>
    this.commentRepliesErrorByCommentId.get(commentId) ?? null;

  isCommentRepliesLoading = (commentId: string): boolean =>
    this.commentRepliesLoadingCommentId === commentId;

  canLoadNextCommentRepliesPage = (commentId: string): boolean => {
    const paging = this.getCommentRepliesPaging(commentId);

    return (
      paging?.has_next !== false &&
      getInstagramMediaPagingCursor(paging, "next") != null
    );
  };

  isPostReferencesLoading = (postId: string): boolean =>
    this.linkProductLoading ||
    this.unlinkProductReferenceId != null ||
    this.postProductVariantsLoadingId === postId;

  hasProductReference = (mediaId: string): boolean => {
    return this.productReferenceMediaIdSet.has(mediaId);
  };

  getSelectedPostDetails = (postId: string): InstagramPostDetails | null => {
    if (this.selectedPostDetails?.post.id === postId) {
      return this.selectedPostDetails;
    }

    return null;
  };

  setMediaFilter = (filter: InstagramMediaFilter): void => {
    runInAction(() => {
      this.mediaFilter = filter;
    });
  };

  setSelectedPostDetails = (
    post: InstagramMediaItem,
    productVariants: InstagramPostProductVariantsResponse | null,
  ): void => {
    runInAction(() => {
      this.selectedPostDetails = {
        post,
        productVariants,
      };
    });
  };

  preparePostDetails = (post: InstagramMediaItem): void => {
    runInAction(() => {
      this.selectedPostDetails = {
        post,
        productVariants: null,
      };
      this.postProductVariantsError = null;
    });
  };

  selectIntegrationId = async (id: InstagramIntegrationId): Promise<void> => {
    const integration = this.integrations.find(
      (item) => String(item.integration_id) === String(id),
    );

    if (!integration) {
      return;
    }

    runInAction(() => {
      this.selectedIntegrationId = integration.integration_id;
      this.mediaItems = [];
      this.mediaPaging = null;
      this.mediaLoaded = false;
      this.mediaError = null;
      this.productReferenceMediaIds = [];
      this.productReferenceMediaIdSet.clear();
      this.productIdsByMediaId.clear();
      this.productReferencesError = null;
      this.postCommentsByPostId.clear();
      this.postCommentsPagingByPostId.clear();
      this.postCommentsErrorByPostId.clear();
      this.commentRepliesByCommentId.clear();
      this.commentRepliesPagingByCommentId.clear();
      this.commentRepliesErrorByCommentId.clear();
      this.postCommentsLoadingPostId = null;
      this.commentRepliesLoadingCommentId = null;
      this.commentReplySendingCommentId = null;
      this.selectedPostDetails = null;
      this.postProductVariantsLoadingId = null;
      this.postProductVariantsError = null;
      this.postAiExtractionLoadingId = null;
      this.postAiExtractionError = null;
      this.postAiExtractionResult = null;
      this.mediaFilter = "all";
    });

    await Promise.allSettled([
      this.loadSelectedIntegrationMediaPage(),
      this.loadSelectedIntegrationProductReferences(),
    ]);
  };

  setSelectedIntegrationKey = async (key: string): Promise<void> => {
    const integration = this.integrations.find(
      (item) => String(item.integration_id) === key,
    );

    if (integration) {
      await this.selectIntegrationId(integration.integration_id);
    }
  };

  loadIntegrations = async (): Promise<void> => {
    runInAction(() => {
      this.listLoading = true;
      this.listError = null;
    });

    try {
      const integrations = await instagramApi.listIntegrations();

      runInAction(() => {
        this.integrations = integrations;
        this.listLoaded = true;

        const selectedStillExists =
          this.selectedIntegrationId != null &&
          integrations.some(
            (item) =>
              String(item.integration_id) ===
              String(this.selectedIntegrationId),
          );

        this.selectedIntegrationId = selectedStillExists
          ? this.selectedIntegrationId
          : (integrations[0]?.integration_id ?? null);
      });

      if (this.selectedIntegrationId != null) {
        await Promise.allSettled([
          this.loadSelectedIntegrationMediaPage(),
          this.loadSelectedIntegrationProductReferences(),
        ]);
      }
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
        this.listLoaded = true;
      });
    } finally {
      runInAction(() => {
        this.listLoading = false;
      });
    }
  };

  loadNextMediaPage = async (): Promise<void> => {
    await this.loadSelectedIntegrationMediaPage(true);
  };

  loadSelectedIntegrationMediaPage = async (
    loadMore = false,
  ): Promise<void> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      return;
    }

    const cursor = loadMore
      ? getInstagramMediaPagingCursor(this.mediaPaging, "next")
      : undefined;

    if (loadMore && cursor == null) {
      return;
    }

    const requestSeq = ++this.mediaRequestSeq;
    const selectedIntegrationId = integration.integration_id;

    runInAction(() => {
      this.mediaLoading = true;
      this.mediaError = null;
    });

    try {
      const page = await instagramApi.listMedia({
        integrationId: integration.integration_id,
        after: loadMore ? cursor : undefined,
      });

      if (
        requestSeq !== this.mediaRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      runInAction(() => {
        if (loadMore) {
          const existingIds = new Set(this.mediaItems.map((item) => item.id));
          const nextPosts = page.posts.filter(
            (item) => !existingIds.has(item.id),
          );

          this.mediaItems = [...this.mediaItems, ...nextPosts];
        } else {
          this.mediaItems = page.posts;
        }

        this.mediaPaging = page.paging;
        this.mediaLoaded = true;
      });
    } catch (e) {
      if (
        requestSeq !== this.mediaRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      runInAction(() => {
        this.mediaError = unknownErrorMessage(e);

        if (!loadMore) {
          this.mediaItems = [];
          this.mediaPaging = null;
        }

        this.mediaLoaded = true;
      });
    } finally {
      if (requestSeq === this.mediaRequestSeq) {
        runInAction(() => {
          this.mediaLoading = false;
        });
      }
    }
  };

  loadSelectedIntegrationProductReferences = async (): Promise<void> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      return;
    }

    const requestSeq = ++this.productReferencesRequestSeq;
    const selectedIntegrationId = integration.integration_id;

    runInAction(() => {
      this.productReferencesError = null;
    });

    try {
      const references = await instagramApi.listProductReferences(
        integration.business_account_id,
      );

      if (
        requestSeq !== this.productReferencesRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      runInAction(() => {
        this.productReferenceMediaIds = references.mediaIds;
        this.productReferenceMediaIdSet = new Set(references.mediaIds);
        this.productIdsByMediaId = new Map(
          Object.entries(references.productIdsByMediaId),
        );
      });
    } catch (e) {
      if (
        requestSeq !== this.productReferencesRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      runInAction(() => {
        this.productReferencesError = unknownErrorMessage(e);
        this.productReferenceMediaIds = [];
        this.productReferenceMediaIdSet.clear();
        this.productIdsByMediaId.clear();
      });
    }
  };

  loadPostProductVariants = async (
    postId: string,
  ): Promise<InstagramPostProductVariantsResponse | null> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      return null;
    }

    const requestSeq = ++this.postProductVariantsRequestSeq;
    const selectedIntegrationId = integration.integration_id;

    runInAction(() => {
      this.postProductVariantsLoadingId = postId;
      this.postProductVariantsError = null;
    });

    try {
      const raw = await instagramApi.getPostProductVariants({
        postId,
        integrationId: integration.integration_id,
      });

      if (
        requestSeq !== this.postProductVariantsRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return null;
      }

      return raw;
    } catch (e) {
      if (
        requestSeq !== this.postProductVariantsRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return null;
      }

      const error = unknownErrorMessage(e);

      runInAction(() => {
        this.postProductVariantsError = error;
      });

      return null;
    } finally {
      if (requestSeq === this.postProductVariantsRequestSeq) {
        runInAction(() => {
          this.postProductVariantsLoadingId = null;
        });
      }
    }
  };

  extractPostWithAi = async (
    postId: string,
  ): Promise<InstagramPostAiExtractionResponse | null> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      const error = "Instagram integration is not selected";

      runInAction(() => {
        this.postAiExtractionError = error;
      });

      return null;
    }

    const requestSeq = ++this.postAiExtractionRequestSeq;
    const selectedIntegrationId = integration.integration_id;

    runInAction(() => {
      this.postAiExtractionLoadingId = postId;
      this.postAiExtractionError = null;
      this.postAiExtractionResult = null;
    });

    try {
      const response = await instagramApi.getPostAiExtraction({
        postId,
        integrationId: integration.integration_id,
      });

      if (
        requestSeq !== this.postAiExtractionRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return null;
      }

      runInAction(() => {
        this.postAiExtractionResult = response;
      });

      return response;
    } catch (e) {
      if (
        requestSeq !== this.postAiExtractionRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return null;
      }

      const error = unknownErrorMessage(e);

      runInAction(() => {
        this.postAiExtractionError = error;
      });

      return null;
    } finally {
      if (requestSeq === this.postAiExtractionRequestSeq) {
        runInAction(() => {
          this.postAiExtractionLoadingId = null;
        });
      }
    }
  };

  loadPostComments = async (
    postId: string,
    loadMore = false,
  ): Promise<void> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      return;
    }

    const cursor = loadMore
      ? getInstagramMediaPagingCursor(
          this.getPostCommentsPaging(postId),
          "next",
        )
      : undefined;

    if (loadMore && cursor == null) {
      return;
    }

    const requestSeq =
      (this.postCommentsRequestSeqByPostId.get(postId) ?? 0) + 1;
    this.postCommentsRequestSeqByPostId.set(postId, requestSeq);
    const selectedIntegrationId = integration.integration_id;

    runInAction(() => {
      this.postCommentsLoadingPostId = postId;
      this.postCommentsErrorByPostId.delete(postId);
    });

    try {
      const page = await instagramApi.listPostComments({
        postId,
        integrationId: integration.integration_id,
        after: loadMore ? cursor : undefined,
        includeReplies: true,
      });

      if (
        this.postCommentsRequestSeqByPostId.get(postId) !== requestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      this.setPostCommentsPage(postId, page, loadMore);
    } catch (e) {
      if (
        this.postCommentsRequestSeqByPostId.get(postId) !== requestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      runInAction(() => {
        this.postCommentsErrorByPostId.set(postId, unknownErrorMessage(e));

        if (!loadMore) {
          this.postCommentsByPostId.set(postId, []);
          this.postCommentsPagingByPostId.set(postId, null);
        }
      });
    } finally {
      if (this.postCommentsRequestSeqByPostId.get(postId) === requestSeq) {
        runInAction(() => {
          this.postCommentsLoadingPostId = null;
        });
      }
    }
  };

  loadCommentReplies = async (
    postId: string,
    commentId: string,
    loadMore = false,
  ): Promise<void> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      return;
    }

    const cursor = loadMore
      ? getInstagramMediaPagingCursor(
          this.getCommentRepliesPaging(commentId),
          "next",
        )
      : undefined;

    if (loadMore && cursor == null) {
      return;
    }

    const requestSeq =
      (this.commentRepliesRequestSeqByCommentId.get(commentId) ?? 0) + 1;
    this.commentRepliesRequestSeqByCommentId.set(commentId, requestSeq);
    const selectedIntegrationId = integration.integration_id;

    runInAction(() => {
      this.commentRepliesLoadingCommentId = commentId;
      this.commentRepliesErrorByCommentId.delete(commentId);
    });

    try {
      const page = await instagramApi.listCommentReplies({
        postId,
        commentId,
        integrationId: integration.integration_id,
        after: loadMore ? cursor : undefined,
      });

      if (
        this.commentRepliesRequestSeqByCommentId.get(commentId) !==
          requestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      this.setCommentRepliesPage(commentId, page, loadMore);
    } catch (e) {
      if (
        this.commentRepliesRequestSeqByCommentId.get(commentId) !==
          requestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      runInAction(() => {
        this.commentRepliesErrorByCommentId.set(
          commentId,
          unknownErrorMessage(e),
        );

        if (!loadMore) {
          this.commentRepliesByCommentId.set(commentId, []);
          this.commentRepliesPagingByCommentId.set(commentId, null);
        }
      });
    } finally {
      if (
        this.commentRepliesRequestSeqByCommentId.get(commentId) === requestSeq
      ) {
        runInAction(() => {
          this.commentRepliesLoadingCommentId = null;
        });
      }
    }
  };

  sendCommentReply = async (
    postId: string,
    commentId: string,
    message: string,
  ): Promise<InstagramComment | null> => {
    const integration = this.selectedIntegration;
    const trimmedMessage = message.trim();

    if (!integration || trimmedMessage === "") {
      return null;
    }

    const optimisticId = `optimistic-${commentId}-${Date.now()}`;
    const optimisticReply: InstagramComment = {
      id: optimisticId,
      text: trimmedMessage,
      timestamp: new Date().toISOString(),
      username: integration.username,
      from: {
        id: integration.business_account_id,
        username: integration.username,
      },
      optimistic: true,
    };
    const existingReplies = this.commentRepliesByCommentId.get(commentId) ?? [];
    const previousReplyCount =
      this.postCommentsByPostId
        .get(postId)
        ?.find((comment) => comment.id === commentId)?.reply_count ??
      existingReplies.length;

    runInAction(() => {
      this.commentReplySendingCommentId = commentId;
      this.commentRepliesByCommentId.set(commentId, [
        ...existingReplies,
        optimisticReply,
      ]);
      this.postCommentsByPostId.set(
        postId,
        (this.postCommentsByPostId.get(postId) ?? []).map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                has_replies: true,
                reply_count: previousReplyCount + 1,
              }
            : comment,
        ),
      );
    });

    try {
      const reply = await instagramApi.replyToComment({
        postId,
        commentId,
        integrationId: integration.integration_id,
        message: trimmedMessage,
      });

      runInAction(() => {
        const existing = this.commentRepliesByCommentId.get(commentId) ?? [];
        const confirmedReply: InstagramComment = reply
          ? {
              ...optimisticReply,
              ...reply,
              text: reply.text.trim() !== "" ? reply.text : trimmedMessage,
              username: reply.username ?? optimisticReply.username,
              from: reply.from ?? optimisticReply.from,
              timestamp: reply.timestamp ?? optimisticReply.timestamp,
              optimistic: false,
            }
          : {
              ...optimisticReply,
              optimistic: false,
            };

        this.commentRepliesByCommentId.set(commentId, [
          ...existing.filter(
            (item) => item.id !== confirmedReply.id && item.id !== optimisticId,
          ),
          confirmedReply,
        ]);

        const comments = this.postCommentsByPostId.get(postId) ?? [];
        this.postCommentsByPostId.set(
          postId,
          comments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  has_replies: true,
                  reply_count: Math.max(
                    comment.reply_count ?? previousReplyCount + 1,
                    previousReplyCount + 1,
                  ),
                }
              : comment,
          ),
        );
      });

      return reply;
    } catch (e) {
      runInAction(() => {
        const existing = this.commentRepliesByCommentId.get(commentId) ?? [];
        this.commentRepliesByCommentId.set(
          commentId,
          existing.filter((item) => item.id !== optimisticId),
        );
        this.postCommentsByPostId.set(
          postId,
          (this.postCommentsByPostId.get(postId) ?? []).map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  reply_count: previousReplyCount,
                  has_replies: previousReplyCount > 0,
                }
              : comment,
          ),
        );
      });

      throw e;
    } finally {
      runInAction(() => {
        if (this.commentReplySendingCommentId === commentId) {
          this.commentReplySendingCommentId = null;
        }
      });
    }
  };

  linkProductToPost = async (input: {
    productId: number;
    productVariantId: number;
    postId: string;
    permalink?: string;
  }): Promise<void> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      throw new Error("Instagram integration is not selected");
    }

    runInAction(() => {
      this.linkProductLoading = true;
    });

    try {
      await productsApi.createInstagramReference(input.productId, {
        businessAccountId: integration.business_account_id,
        postId: input.postId,
        productVariantId: input.productVariantId,
        permalink: input.permalink ?? "",
      });

      await this.refreshPostProductReferences(input.postId);
    } finally {
      runInAction(() => {
        this.linkProductLoading = false;
      });
    }
  };

  unlinkProductFromPost = async (input: {
    productId: number;
    referenceId: number | string;
    postId: string;
  }): Promise<void> => {
    runInAction(() => {
      this.unlinkProductReferenceId = input.referenceId;
    });

    try {
      await productsApi.deleteInstagramReference(
        input.productId,
        input.referenceId,
      );

      await this.refreshPostProductReferences(input.postId);
    } finally {
      runInAction(() => {
        this.unlinkProductReferenceId = null;
      });
    }
  };

  private setPostCommentsPage = (
    postId: string,
    page: InstagramCommentsPage,
    append: boolean,
  ): void => {
    runInAction(() => {
      if (append) {
        const existing = this.postCommentsByPostId.get(postId) ?? [];
        const existingIds = new Set(existing.map((item) => item.id));
        const nextComments = page.comments.filter(
          (item) => !existingIds.has(item.id),
        );

        this.postCommentsByPostId.set(postId, [...existing, ...nextComments]);
      } else {
        this.postCommentsByPostId.set(postId, page.comments);
      }

      page.comments.forEach((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          this.commentRepliesByCommentId.set(comment.id, comment.replies);
        }
      });

      this.postCommentsPagingByPostId.set(postId, page.paging);
    });
  };

  private setCommentRepliesPage = (
    commentId: string,
    page: InstagramCommentsPage,
    append: boolean,
  ): void => {
    runInAction(() => {
      if (append) {
        const existing = this.commentRepliesByCommentId.get(commentId) ?? [];
        const existingIds = new Set(existing.map((item) => item.id));
        const nextReplies = page.comments.filter(
          (item) => !existingIds.has(item.id),
        );

        this.commentRepliesByCommentId.set(commentId, [
          ...existing,
          ...nextReplies,
        ]);
      } else {
        this.commentRepliesByCommentId.set(commentId, page.comments);
      }

      this.commentRepliesPagingByCommentId.set(commentId, page.paging);
    });
  };

  private refreshPostProductReferences = async (
    postId: string,
  ): Promise<void> => {
    const post =
      this.selectedPostDetails?.post.id === postId
        ? this.selectedPostDetails.post
        : this.mediaItems.find((item) => item.id === postId);

    if (post) {
      const productVariants = await this.loadPostProductVariants(postId);
      this.setSelectedPostDetails(post, productVariants);
    }

    await this.loadSelectedIntegrationProductReferences();
  };
}
