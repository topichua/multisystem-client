import { useContext } from "react";

import { ConversationGroupsStoreContext } from "./conversation-groups-store-context";
import type { ConversationGroupsStore } from "./conversation-groups-store";

export const useConversationGroupsStore = (): ConversationGroupsStore => {
  const store = useContext(ConversationGroupsStoreContext);

  if (!store) {
    throw new Error(
      "useConversationGroupsStore must be used within ConversationGroupsProvider",
    );
  }

  return store;
};
