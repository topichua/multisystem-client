import { ViewportRoute } from "@/app/router/viewport-route";

import { InstagramPage } from "./instagram-page";
import { MobileInstagramPage } from "./mobile-instagram-page";

export const InstagramPageRoute = () => (
  <ViewportRoute mobile={<MobileInstagramPage />} desktop={<InstagramPage />} />
);
