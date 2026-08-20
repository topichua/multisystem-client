import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

export const useCloseConversationMissingFromList = (
  isOpenConversationInList: boolean,
): boolean => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { listLoaded, listLoading } = useConversationsStore();

  const shouldClose = Boolean(
    conversationId && listLoaded && !listLoading && !isOpenConversationInList,
  );

  useEffect(() => {
    if (!shouldClose) {
      return;
    }

    navigate(pagesMap.conversations, { replace: true });
  }, [navigate, shouldClose]);

  return shouldClose;
};
