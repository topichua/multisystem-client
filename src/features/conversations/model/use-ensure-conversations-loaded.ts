import { useEffect } from "react";

import { useConversationsStore } from "./use-conversations-store";

export const useEnsureConversationsLoaded = (): void => {
  const conversationsStore = useConversationsStore();

  useEffect(() => {
    if (conversationsStore.listLoaded || conversationsStore.listLoading) {
      return;
    }

    void conversationsStore.loadConversations();
  }, [
    conversationsStore,
    conversationsStore.listLoaded,
    conversationsStore.listLoading,
  ]);
};
