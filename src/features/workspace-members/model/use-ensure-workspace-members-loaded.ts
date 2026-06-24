import { useEffect } from "react";

import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";

export const useEnsureWorkspaceMembersLoaded = (): void => {
  const membersStore = useWorkspaceMembersStore();

  useEffect(() => {
    if (membersStore.members.length === 0 && !membersStore.listLoading) {
      void membersStore.loadMembers();
    }
  }, [membersStore, membersStore.listLoading, membersStore.members.length]);
};
