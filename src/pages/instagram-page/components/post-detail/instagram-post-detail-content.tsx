import { Alert, Flex, Spin } from "antd";
import { useState } from "react";

import type {
  InstagramIntegration,
  InstagramMediaItem,
} from "@/features/instagram/model/instagram.types";

import type { InstagramPostPageController } from "../../controllers/use-instagram-post-page-controller";
import { InstagramPostCommentsPanel } from "./instagram-post-comments-panel";
import { InstagramPostDetailNavigation } from "./instagram-post-detail-navigation";
import { InstagramPostLinkedProductsSection } from "./instagram-post-linked-products-section";
import { InstagramPostSummary } from "./instagram-post-summary";
import * as S from "./instagram-post-detail-content.styled";

type InstagramPostDetailContentProps = {
  controller: InstagramPostPageController;
  post: InstagramMediaItem;
  selectedIntegration: InstagramIntegration;
};

export const InstagramPostDetailContent = ({
  controller,
  post,
  selectedIntegration,
}: InstagramPostDetailContentProps) => {
  const [commentsOpen, setCommentsOpen] = useState(true);
  const { store, productVariantsLoading } = controller;
  const closeComments = () => setCommentsOpen(false);
  const toggleComments = () => setCommentsOpen((open) => !open);

  return (
    <S.Content data-qa="instagram-post-detail-content">
      <S.Layout $commentsOpen={commentsOpen}>
        <InstagramPostDetailNavigation controller={controller} />
        <InstagramPostCommentsPanel
          commentsOpen={commentsOpen}
          controller={controller}
          onClose={closeComments}
          postId={post.id}
        />

        <S.Main>
          {store.postProductVariantsError ? (
            <S.WarningAlert>
              <Alert
                type="warning"
                showIcon
                title={store.postProductVariantsError}
              />
            </S.WarningAlert>
          ) : null}

          <Spin spinning={productVariantsLoading}>
            <Flex vertical gap={24}>
              <InstagramPostSummary
                commentsOpen={commentsOpen}
                post={post}
                selectedIntegration={selectedIntegration}
                onToggleComments={toggleComments}
              />
              <InstagramPostLinkedProductsSection
                controller={controller}
                post={post}
              />
            </Flex>
          </Spin>
        </S.Main>
      </S.Layout>
    </S.Content>
  );
};
