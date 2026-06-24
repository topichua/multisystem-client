import { observer } from "mobx-react-lite";

import { InstagramMediaBrowser } from "./components/media/instagram-media-browser";
import { InstagramPageShell } from "./components/shared/instagram-page-shell";
import { useInstagramPageController } from "./controllers/use-instagram-page-controller";

export const InstagramPage = observer(() => {
  const controller = useInstagramPageController();

  return (
    <InstagramPageShell controller={controller}>
      <InstagramMediaBrowser
        controller={controller}
        onPostClick={controller.openPostDetails}
      />
    </InstagramPageShell>
  );
});
