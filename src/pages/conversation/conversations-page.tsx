import { Outlet } from "react-router";

import { ConversationsShell } from "@/components/layout/conversations-shell";

import { ConversationGroupsPane } from "./conversation-groups-pane/conversation-groups-pane";
import { Conversation } from "./conversation-list";

export const ConversationsPage = () => {
  return (
    <ConversationsShell.Root>
      <ConversationGroupsPane />
      <ConversationsShell.ListPane>
        <Conversation />
      </ConversationsShell.ListPane>
      <ConversationsShell.ThreadPane>
        <Outlet />
      </ConversationsShell.ThreadPane>
    </ConversationsShell.Root>
  );
};
