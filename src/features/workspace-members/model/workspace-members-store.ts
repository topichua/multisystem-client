import { makeAutoObservable, runInAction } from "mobx";

import { workspaceMembersApi } from "@/features/workspace-members/api/workspace-members-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  InviteRoleSlug,
  WorkspaceMember,
  WorkspaceMemberInvitePayload,
} from "./workspace-member.types";

const DEFAULT_ROLE_IDS: Record<InviteRoleSlug, number> = {
  manager: 1,
  operator: 2,
};

export class WorkspaceMembersStore {
  members: WorkspaceMember[] = [];

  listLoading = false;
  listError: string | null = null;

  inviteLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  resolveRoleId = (slug: InviteRoleSlug): number => {
    const fromMember = this.members.find((member) => member.roleSlug === slug);
    return fromMember?.roleId ?? DEFAULT_ROLE_IDS[slug];
  };

  loadMembers = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const items = await workspaceMembersApi.list();
      runInAction(() => {
        this.members = items;
        this.listError = null;
      });
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
      });
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  inviteMember = async (
    payload: WorkspaceMemberInvitePayload,
  ): Promise<WorkspaceMember | null> => {
    runInAction(() => {
      this.inviteLoading = true;
    });

    try {
      const response = await workspaceMembersApi.invite(payload);
      await this.loadMembers({ silent: true });
      return response?.member ?? null;
    } finally {
      runInAction(() => {
        this.inviteLoading = false;
      });
    }
  };
}
