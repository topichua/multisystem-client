import { Alert, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import { InstagramIntegrationGate } from "./components/instagram-integration-gate";
import { InstagramMediaFilters } from "./components/instagram-media-filters";
import { InstagramMediaGrid } from "./components/instagram-media-grid";
import { InstagramPageShell } from "./components/instagram-page-shell";
import { InstagramPagination } from "./components/instagram-pagination";
import { InstagramProfileHeader } from "./components/instagram-profile-header";
import { useInstagramPageController } from "./controllers/use-instagram-page-controller";
import * as S from "./instagram-page.styled";

export const InstagramPage = observer(() => {
  const { t } = useTranslation();
  const controller = useInstagramPageController();
  const { store, selectedIntegration } = controller;

  return (
    <InstagramPageShell controller={controller}>
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Body data-qa="layout-instagram-content-scroll">
          <InstagramIntegrationGate controller={controller}>
            <S.Content>
              <InstagramProfileHeader
                integration={selectedIntegration!}
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

              {controller.initialMediaLoading ? (
                <S.CenteredState>
                  <Spin />
                </S.CenteredState>
              ) : store.visibleMediaItems.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    store.mediaItems.length === 0
                      ? t("instagram.noPosts")
                      : t("instagram.noPostsForFilter")
                  }
                  style={{ marginTop: 48 }}
                />
              ) : (
                <InstagramMediaGrid
                  posts={store.visibleMediaItems}
                  hasProductReference={(mediaId) =>
                    store.hasProductReference(mediaId)
                  }
                  productIdsByMediaId={store.productIdsByMediaId}
                  onPostClick={controller.openPostDetails}
                />
              )}

              <InstagramPagination
                page={store.mediaPageIndex}
                loading={store.mediaLoading}
                canLoadPrevious={store.canLoadPreviousMediaPage}
                canLoadNext={store.canLoadNextMediaPage}
                onPrevious={controller.loadPreviousMediaPage}
                onNext={controller.loadNextMediaPage}
              />
            </S.Content>
          </InstagramIntegrationGate>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </InstagramPageShell>
  );
});
