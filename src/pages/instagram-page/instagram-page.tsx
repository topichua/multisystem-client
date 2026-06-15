import { observer } from "mobx-react-lite";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import { InstagramMediaBrowser } from "./components/instagram-media-browser";
import { InstagramPageShell } from "./components/instagram-page-shell";
import { useInstagramPageController } from "./controllers/use-instagram-page-controller";

export const InstagramPage = observer(() => {
  const controller = useInstagramPageController();

  return (
    <InstagramPageShell controller={controller}>
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Body data-qa="layout-instagram-content-scroll">
          <InstagramMediaBrowser
            controller={controller}
            onPostClick={controller.openPostDetails}
          />
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </InstagramPageShell>
  );
});
