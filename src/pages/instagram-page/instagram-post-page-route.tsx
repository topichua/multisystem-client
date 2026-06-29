import { ViewportRoute } from "@/app/router/viewport-route";

import { InstagramPostPage } from "./instagram-post-page";
import { MobileInstagramPostPage } from "./mobile-instagram-post-page";

export const InstagramPostPageRoute = () => (
  <ViewportRoute
    mobile={<MobileInstagramPostPage />}
    desktop={<InstagramPostPage />}
  />
);
