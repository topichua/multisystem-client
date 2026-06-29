import { Alert, Drawer, Flex, Spin } from "antd";
import { useState } from "react";

import type {
  InstagramIntegration,
  InstagramMediaItem,
} from "@/features/instagram/model/instagram.types";

import type { InstagramPostPageController } from "../../controllers/use-instagram-post-page-controller";
import {
  InstagramPostComments,
  InstagramPostCommentsHeader,
} from "../post-comments/instagram-post-comments";
import { InstagramPostCommentsPanel } from "./instagram-post-comments-panel";
import { InstagramPostDetailNavigation } from "./instagram-post-detail-navigation";
import { InstagramPostLinkedProductsSection } from "./instagram-post-linked-products-section";
import { InstagramPostSummary } from "./instagram-post-summary";
import * as S from "./instagram-post-detail-content.styled";

type InstagramPostDetailVariant = "desktop" | "mobile";

type InstagramPostDetailContentProps = {
  controller: InstagramPostPageController;
  post: InstagramMediaItem;
  selectedIntegration: InstagramIntegration;
  variant?: InstagramPostDetailVariant;
};

export const InstagramPostDetailContent = ({
  controller,
  post,
  selectedIntegration,
  variant = "desktop",
}: InstagramPostDetailContentProps) => {
  const isMobile = variant === "mobile";
  const [commentsOpen, setCommentsOpen] = useState(() => !isMobile);
  const { store, productVariantsLoading } = controller;
  const closeComments = () => setCommentsOpen(false);
  const toggleComments = () => setCommentsOpen((open) => !open);

  return (
    <S.Content data-qa="instagram-post-detail-content">
      <S.Layout $commentsOpen={!isMobile && commentsOpen} $variant={variant}>
        {!isMobile ? (
          <>
            <InstagramPostDetailNavigation controller={controller} />
            <InstagramPostCommentsPanel
              commentsOpen={commentsOpen}
              controller={controller}
              onClose={closeComments}
              postId={post.id}
            />
          </>
        ) : null}

        <S.Main $variant={variant}>
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
            <Flex vertical gap={isMobile ? 16 : 24}>
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

      {isMobile ? (
        <Drawer
          destroyOnHidden
          closable={false}
          open={commentsOpen}
          placement="bottom"
          height="calc(100dvh - env(safe-area-inset-top, 0px))"
          title={
            <InstagramPostCommentsHeader
              controller={controller}
              onClose={closeComments}
              postId={post.id}
            />
          }
          styles={{
            header: { padding: "10px 14px" },
            body: { padding: 0, overflow: "hidden" },
          }}
          onClose={closeComments}
        >
          <S.MobileCommentsDrawerBody>
            <InstagramPostComments controller={controller} postId={post.id} />
          </S.MobileCommentsDrawerBody>
        </Drawer>
      ) : null}
    </S.Content>
  );
};
