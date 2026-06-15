import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";

import type {
  InstagramMediaItem,
  InstagramPostAiExtractionResponse,
} from "@/features/instagram/model/instagram.types";
import { InstagramMediaBrowser } from "@/pages/instagram-page/components/instagram-media-browser";
import { useInstagramPageController } from "@/pages/instagram-page/controllers/use-instagram-page-controller";

import { ProductInstagramPostAnalyzeView } from "./components/product-instagram-post-analyze-view";
import type {
  ProductInstagramAiCategoryOption,
  ProductInstagramAiFillHandler,
} from "./product-instagram-ai.types";

type ProductInstagramAiDrawerContentProps = {
  categoryOptions: readonly ProductInstagramAiCategoryOption[];
  onFillProductForm?: ProductInstagramAiFillHandler;
};

export const ProductInstagramAiDrawerContent = observer(
  ({
    categoryOptions,
    onFillProductForm,
  }: ProductInstagramAiDrawerContentProps) => {
    const controller = useInstagramPageController();
    const { store } = controller;
    const [selectedPost, setSelectedPost] = useState<InstagramMediaItem | null>(
      null,
    );
    const [fillLoading, setFillLoading] = useState(false);

    const handleAnalyzePost = useCallback(
      (post: InstagramMediaItem) => {
        void store.extractPostWithAi(post.id);
      },
      [store],
    );

    const handleFillProductForm = useCallback(
      async (extraction: InstagramPostAiExtractionResponse) => {
        if (!onFillProductForm) {
          return;
        }

        setFillLoading(true);

        try {
          await onFillProductForm(extraction);
        } finally {
          setFillLoading(false);
        }
      },
      [onFillProductForm],
    );

    if (selectedPost) {
      const extraction =
        store.postAiExtractionResult?.sourceInstagramPostId === selectedPost.id
          ? store.postAiExtractionResult
          : null;

      return (
        <ProductInstagramPostAnalyzeView
          post={selectedPost}
          analyzeError={store.postAiExtractionError}
          analyzeLoading={store.postAiExtractionLoadingId === selectedPost.id}
          categoryOptions={categoryOptions}
          extraction={extraction}
          fillLoading={fillLoading}
          onBack={() => setSelectedPost(null)}
          onAnalyzePost={handleAnalyzePost}
          onFillProductForm={handleFillProductForm}
        />
      );
    }

    return (
      <InstagramMediaBrowser
        controller={controller}
        onPostClick={setSelectedPost}
      />
    );
  },
);
