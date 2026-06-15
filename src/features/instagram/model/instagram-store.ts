import { makeAutoObservable, runInAction } from "mobx";

import { instagramApi } from "@/features/instagram/api/instagram-api";
import { productsApi } from "@/features/products/api/products-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import { getInstagramMediaPagingCursor } from "./instagram-parsers";
import type {
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
  mediaPageIndex = 1;
  mediaLoading = false;
  mediaLoaded = false;
  mediaError: string | null = null;

  productReferenceMediaIds: string[] = [];
  productIdsByMediaId = new Map<string, string[]>();
  productVariantIdsByMediaId = new Map<string, string[]>();
  productReferencesLoading = false;
  productReferencesLoaded = false;
  productReferencesError: string | null = null;

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

  get nextMediaCursor(): string | undefined {
    return getInstagramMediaPagingCursor(this.mediaPaging, "next");
  }

  get previousMediaCursor(): string | undefined {
    return getInstagramMediaPagingCursor(this.mediaPaging, "previous");
  }

  get canLoadNextMediaPage(): boolean {
    return this.mediaPaging?.has_next !== false && this.nextMediaCursor != null;
  }

  get canLoadPreviousMediaPage(): boolean {
    return (
      this.mediaPaging?.has_previous !== false &&
      this.previousMediaCursor != null &&
      this.mediaPageIndex > 1
    );
  }

  isPostReferencesLoading = (postId: string): boolean =>
    this.linkProductLoading ||
    this.unlinkProductReferenceId != null ||
    this.postProductVariantsLoadingId === postId;

  hasProductReference(mediaId: string): boolean {
    return this.productReferenceMediaIds.includes(mediaId);
  }

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
      this.mediaPageIndex = 1;
      this.mediaLoaded = false;
      this.mediaError = null;
      this.productReferenceMediaIds = [];
      this.productIdsByMediaId.clear();
      this.productVariantIdsByMediaId.clear();
      this.productReferencesLoaded = false;
      this.productReferencesError = null;
      this.selectedPostDetails = null;
      this.postProductVariantsLoadingId = null;
      this.postProductVariantsError = null;
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
    await this.loadSelectedIntegrationMediaPage("next");
  };

  loadPreviousMediaPage = async (): Promise<void> => {
    await this.loadSelectedIntegrationMediaPage("previous");
  };

  loadSelectedIntegrationMediaPage = async (
    direction?: "next" | "previous",
  ): Promise<void> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      return;
    }

    const cursor =
      direction != null
        ? getInstagramMediaPagingCursor(this.mediaPaging, direction)
        : undefined;

    if (direction != null && cursor == null) {
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
        after: direction === "next" ? cursor : undefined,
        before: direction === "previous" ? cursor : undefined,
      });

      if (
        requestSeq !== this.mediaRequestSeq ||
        String(this.selectedIntegrationId) !== String(selectedIntegrationId)
      ) {
        return;
      }

      runInAction(() => {
        this.mediaItems = page.posts;
        this.mediaPaging = page.paging;
        this.mediaLoaded = true;

        if (direction === "next") {
          this.mediaPageIndex += 1;
        } else if (direction === "previous") {
          this.mediaPageIndex = Math.max(1, this.mediaPageIndex - 1);
        } else {
          this.mediaPageIndex = 1;
        }
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
        this.mediaItems = [];
        this.mediaPaging = null;
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
      this.productReferencesLoading = true;
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
        this.productIdsByMediaId = new Map(
          Object.entries(references.productIdsByMediaId),
        );
        this.productVariantIdsByMediaId = new Map(
          Object.entries(references.productVariantIdsByMediaId),
        );
        this.productReferencesLoaded = true;
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
        this.productIdsByMediaId.clear();
        this.productVariantIdsByMediaId.clear();
        this.productReferencesLoaded = true;
      });
    } finally {
      if (requestSeq === this.productReferencesRequestSeq) {
        runInAction(() => {
          this.productReferencesLoading = false;
        });
      }
    }
  };

  loadPostProductVariants = async (
    postId: string,
  ): Promise<InstagramPostProductVariantsResponse | null> => {
    const integration = this.selectedIntegration;

    if (!integration) {
      return null;
    }

    runInAction(() => {
      this.postProductVariantsLoadingId = postId;
      this.postProductVariantsError = null;
    });

    try {
      const raw = await instagramApi.getPostProductVariants({
        postId,
        integrationId: integration.integration_id,
      });

      return raw;
    } catch (e) {
      const error = unknownErrorMessage(e);

      runInAction(() => {
        this.postProductVariantsError = error;
      });

      return null;
    } finally {
      runInAction(() => {
        if (this.postProductVariantsLoadingId === postId) {
          this.postProductVariantsLoadingId = null;
        }
      });
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

      runInAction(() => {
        this.postAiExtractionResult = response;
      });

      return response;
    } catch (e) {
      const error = unknownErrorMessage(e);

      runInAction(() => {
        this.postAiExtractionError = error;
      });

      return null;
    } finally {
      runInAction(() => {
        if (this.postAiExtractionLoadingId === postId) {
          this.postAiExtractionLoadingId = null;
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
