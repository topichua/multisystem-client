import { ViewportRoute } from "@/app/router/viewport-route";

import { ConversationDetails } from "./conversation-details/conversation-details";

export const ConversationDetailRoute = () => (
  <ViewportRoute
    mobile={<ConversationDetails />}
    desktop={<ConversationDetails />}
  />
);
