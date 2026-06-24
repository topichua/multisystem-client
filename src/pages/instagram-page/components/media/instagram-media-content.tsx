import { Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";
import { useIntersectionLoadMore } from "@/utils/use-intersection-load-more";

import type { InstagramPageController } from "../../controllers/use-instagram-page-controller";
import * as S from "../../instagram-page.styled";
import { InstagramMediaAlerts } from "./instagram-media-alerts";
import { InstagramMediaFilters } from "./instagram-media-filters";
import { InstagramMediaGrid } from "./instagram-media-grid";

type InstagramMediaContentProps = {
  controller: InstagramPageController;
  onPostClick: (post: InstagramMediaItem) => void;
};

export const InstagramMediaContent = observer(
  ({ controller, onPostClick }: InstagramMediaContentProps) => {
    const { t } = useTranslation();
    const { store } = controller;

    const {
      mediaError,
      mediaFilter,
      mediaItems,
      mediaLoaded,
      mediaLoading,
      mediaLoadingMore,
      productIdsByMediaId,
      productReferencesError,
      selectedIntegration,
      visibleMediaItems,
    } = store;

    const canLoadMore = store.canLoadNextMediaPage;

    const isInitialLoading =
      selectedIntegration != null && !mediaLoaded && mediaLoading;

    const isEmpty = !isInitialLoading && visibleMediaItems.length === 0;

    const showLoadMoreSpinner =
      !isInitialLoading && mediaLoadingMore && visibleMediaItems.length > 0;

    const loadMoreSentinelRef = useIntersectionLoadMore({
      enabled: selectedIntegration != null && mediaLoaded,
      hasMore: canLoadMore,
      loading: mediaLoading,
      onLoadMore: controller.loadNextMediaPage,
    });

    useEffect(() => {
      const shouldLoadNextPage =
        mediaLoaded &&
        !mediaLoading &&
        !mediaError &&
        canLoadMore &&
        visibleMediaItems.length === 0;

      if (shouldLoadNextPage) {
        controller.loadNextMediaPage();
      }
    }, [
      canLoadMore,
      controller,
      mediaError,
      mediaFilter,
      mediaLoaded,
      mediaLoading,
      visibleMediaItems.length,
    ]);

    const renderContent = () => {
      if (isInitialLoading) {
        return (
          <S.CenteredState>
            <Spin />
          </S.CenteredState>
        );
      }

      if (isEmpty) {
        if (mediaLoadingMore) {
          return (
            <S.LoadMoreState>
              <Spin />
            </S.LoadMoreState>
          );
        }

        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              mediaItems.length === 0
                ? t("instagram.noPosts")
                : t("instagram.noPostsForFilter")
            }
            style={{ marginTop: 48 }}
          />
        );
      }

      return (
        <>
          <InstagramMediaGrid
            posts={visibleMediaItems}
            hasProductReference={store.hasProductReference}
            productIdsByMediaId={productIdsByMediaId}
            onPostClick={onPostClick}
          />

          {canLoadMore && <S.LoadMoreSentinel ref={loadMoreSentinelRef} />}

          {showLoadMoreSpinner && (
            <S.LoadMoreState>
              <Spin />
            </S.LoadMoreState>
          )}
        </>
      );
    };

    return (
      <S.MediaContentRoot>
        <S.MediaFiltersSlot>
          <S.MediaFiltersInner>
            <InstagramMediaFilters
              activeFilter={mediaFilter}
              getFilterCount={controller.getFilterCount}
              onChange={controller.selectMediaFilter}
            />
          </S.MediaFiltersInner>
        </S.MediaFiltersSlot>

        <S.MediaScroll data-qa="layout-instagram-content-scroll">
          <S.MediaContentInner>
            <InstagramMediaAlerts
              mediaError={mediaError}
              productReferencesError={productReferencesError}
            />

            {renderContent()}
          </S.MediaContentInner>
        </S.MediaScroll>
      </S.MediaContentRoot>
    );
  },
);
