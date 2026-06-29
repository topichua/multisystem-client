import { ViewportRoute } from "@/app/router/viewport-route";

import { EmptyConversation } from "./empty-conversation";
import { MobileConversationsListPage } from "./mobile-conversations-list-page";

export const ConversationsIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileConversationsListPage />}
    desktop={<EmptyConversation />}
  />
);
