import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";

import { getPostCoverUrl } from "../utils/instagram-page-format";
import { useInstagramPageController } from "./use-instagram-page-controller";

export const useInstagramPostPageController = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const pageController = useInstagramPageController();
  const { store, selectedIntegration } = pageController;

  const details = postId ? store.getSelectedPostDetails(postId) : null;
  const post =
    details?.post ??
    store.mediaItems.find((item) => item.id === postId) ??
    null;
  const productVariants = details?.productVariants ?? null;
  const linkedProducts = productVariants?.items ?? [];
  const productCount = linkedProducts.length;
  const coverUrl = post ? getPostCoverUrl(post) : undefined;
  const carouselCount = post?.children?.length ?? 0;
  const productVariantsLoading =
    post != null &&
    productVariants == null &&
    store.postProductVariantsError == null;
  const linkedProductsSectionLoading =
    post != null &&
    (productVariantsLoading || store.isPostReferencesLoading(post.id));

  useEffect(() => {
    if (
      post == null ||
      selectedIntegration == null ||
      productVariants != null ||
      store.postProductVariantsError != null ||
      store.postProductVariantsLoadingId === post.id
    ) {
      return;
    }

    void store.loadPostProductVariants(post.id).then((response) => {
      store.setSelectedPostDetails(post, response);
    });
  }, [
    post,
    productVariants,
    selectedIntegration,
    store,
    store.postProductVariantsError,
    store.postProductVariantsLoadingId,
  ]);

  const handleSelectIntegration = (key: string) => {
    pageController.selectIntegrationKey(key);
    navigate(pagesMap.instagram);
  };

  return {
    ...pageController,
    postId,
    post,
    productVariants,
    linkedProducts,
    productCount,
    coverUrl,
    carouselCount,
    productVariantsLoading,
    linkedProductsSectionLoading,
    handleSelectIntegration,
    navigateBack: () => navigate(pagesMap.instagram),
  };
};

export type InstagramPostPageController = ReturnType<
  typeof useInstagramPostPageController
>;
