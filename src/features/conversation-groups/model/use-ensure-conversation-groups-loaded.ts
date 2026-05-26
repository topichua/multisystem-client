import { useEffect } from "react";

import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";

export const useEnsureConversationGroupsLoaded = (): void => {
  const groupsStore = useConversationGroupsStore();

  useEffect(() => {
    void groupsStore.loadGroups({ silent: true });
  }, [groupsStore]);
};
