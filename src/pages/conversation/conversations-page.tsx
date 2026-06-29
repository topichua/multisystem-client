import { Outlet } from "react-router";
import { useState } from "react";

import { ConversationsShell } from "@/components/layout/conversations-shell";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ConversationGroupsPane } from "./conversation-groups-pane/conversation-groups-pane";
import { Conversation } from "./conversation-list";

export const ConversationsPage = () => {
  const [groupsCollapsed, setGroupsCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const isMobileViewport = useIsMobileViewport();

  if (isMobileViewport) {
    return <Outlet />;
  }

  return (
    <ConversationsShell.Root
      $groupsCollapsed={groupsCollapsed}
      $listCollapsed={listCollapsed}
    >
      <ConversationGroupsPane
        collapsed={groupsCollapsed}
        onCollapse={() => setGroupsCollapsed(true)}
        onExpand={() => setGroupsCollapsed(false)}
      />
      <ConversationsShell.ListPane>
        <Conversation
          collapsed={listCollapsed}
          onCollapse={() => setListCollapsed(true)}
          onExpand={() => setListCollapsed(false)}
        />
      </ConversationsShell.ListPane>
      <ConversationsShell.ThreadPane>
        <Outlet />
      </ConversationsShell.ThreadPane>
    </ConversationsShell.Root>
  );
};
