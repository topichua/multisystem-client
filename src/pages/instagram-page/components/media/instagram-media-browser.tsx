import { observer } from "mobx-react-lite";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";

import type { InstagramPageController } from "../../controllers/use-instagram-page-controller";
import { InstagramIntegrationGate } from "../integrations/instagram-integration-gate";
import { InstagramProfileHeader } from "../shared/instagram-profile-header";
import { InstagramMediaContent } from "./instagram-media-content";

export type InstagramMediaBrowserProps = {
  controller: InstagramPageController;
  onPostClick: (post: InstagramMediaItem) => void;
};

export const InstagramMediaBrowser = observer(
  ({ controller, onPostClick }: InstagramMediaBrowserProps) => {
    const { store } = controller;
    const { selectedIntegration } = store;

    return (
      <InstagramIntegrationGate controller={controller}>
        {selectedIntegration && (
          <PaneDetailLayout.Root>
            <PaneDetailLayout.Header data-qa="layout-instagram-media-header">
              <InstagramProfileHeader
                integration={selectedIntegration}
                mediaPaging={store.mediaPaging}
              />
            </PaneDetailLayout.Header>

            <PaneDetailLayout.Body
              data-qa="layout-instagram-content"
              style={{
                overflow: "hidden",
                padding: 0,
              }}
            >
              <InstagramMediaContent
                controller={controller}
                onPostClick={onPostClick}
              />
            </PaneDetailLayout.Body>
          </PaneDetailLayout.Root>
        )}
      </InstagramIntegrationGate>
    );
  },
);
