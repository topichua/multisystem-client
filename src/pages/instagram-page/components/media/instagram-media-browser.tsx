import { Alert, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";
import { useIntersectionLoadMore } from "@/utils/use-intersection-load-more";

import type { InstagramPageController } from "../../controllers/use-instagram-page-controller";
import * as S from "../../instagram-page.styled";
import { InstagramIntegrationGate } from "../integrations/instagram-integration-gate";
import { InstagramProfileHeader } from "../shared/instagram-profile-header";
import { InstagramMediaFilters } from "./instagram-media-filters";
import { InstagramMediaGrid } from "./instagram-media-grid";
// import { InstagramPagination } from "./instagram-pagination";

export type InstagramMediaBrowserProps = {
  controller: InstagramPageController;
  onPostClick: (post: InstagramMediaItem) => void;
};

export const InstagramMediaBrowser = observer(
  ({ controller, onPostClick }: InstagramMediaBrowserProps) => {
    const { t } = useTranslation();
    const { store } = controller;
    const selectedIntegration = store.selectedIntegration;
    const initialMediaLoading =
      selectedIntegration != null && !store.mediaLoaded && store.mediaLoading;
    const canLoadMore = store.canLoadNextMediaPage;
    const loadMoreSentinelRef = useIntersectionLoadMore({
      enabled: selectedIntegration != null && store.mediaLoaded,
      hasMore: canLoadMore,
      loading: store.mediaLoading,
      onLoadMore: controller.loadNextMediaPage,
    });

    useEffect(() => {
      if (
        !initialMediaLoading &&
        store.mediaLoaded &&
        !store.mediaLoading &&
        !store.mediaError &&
        canLoadMore &&
        store.visibleMediaItems.length === 0
      ) {
        controller.loadNextMediaPage();
      }
    }, [
      canLoadMore,
      controller,
      initialMediaLoading,
      store.mediaError,
      store.mediaFilter,
      store.mediaLoaded,
      store.mediaLoading,
      store.visibleMediaItems.length,
    ]);

    return (
      <InstagramIntegrationGate controller={controller}>
        {selectedIntegration ? (
          <S.Content>
            <InstagramProfileHeader
              integration={selectedIntegration}
              mediaPaging={store.mediaPaging}
            />

            <InstagramMediaFilters
              activeFilter={store.mediaFilter}
              getFilterCount={controller.getFilterCount}
              onChange={controller.selectMediaFilter}
            />

            {store.mediaError ? (
              <Alert
                type="error"
                showIcon
                title={store.mediaError}
                style={{ marginBottom: 16 }}
              />
            ) : null}

            {store.productReferencesError ? (
              <Alert
                type="warning"
                showIcon
                title={store.productReferencesError}
                style={{ marginBottom: 16 }}
              />
            ) : null}

            {initialMediaLoading ? (
              <S.CenteredState>
                <Spin />
              </S.CenteredState>
            ) : store.visibleMediaItems.length === 0 ? (
              store.mediaLoadingMore ? (
                <S.LoadMoreState>
                  <Spin />
                </S.LoadMoreState>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    store.mediaItems.length === 0
                      ? t("instagram.noPosts")
                      : t("instagram.noPostsForFilter")
                  }
                  style={{ marginTop: 48 }}
                />
              )
            ) : (
              <>
                <InstagramMediaGrid
                  posts={store.visibleMediaItems}
                  hasProductReference={(mediaId) =>
                    store.hasProductReference(mediaId)
                  }
                  productIdsByMediaId={store.productIdsByMediaId}
                  onPostClick={onPostClick}
                />

                {canLoadMore ? (
                  <S.LoadMoreSentinel ref={loadMoreSentinelRef} />
                ) : null}

                {store.mediaLoadingMore ? (
                  <S.LoadMoreState>
                    <Spin />
                  </S.LoadMoreState>
                ) : null}
              </>
            )}

            {/* <InstagramPagination
              page={store.mediaPageIndex}
              loading={store.mediaLoading}
              canLoadPrevious={store.canLoadPreviousMediaPage}
              canLoadNext={store.canLoadNextMediaPage}
              onPrevious={controller.loadPreviousMediaPage}
              onNext={controller.loadNextMediaPage}
            /> */}
          </S.Content>
        ) : null}
      </InstagramIntegrationGate>
    );
  },
);
