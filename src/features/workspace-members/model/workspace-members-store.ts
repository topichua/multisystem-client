import { makeAutoObservable, runInAction } from "mobx";

import { workspaceMembersApi } from "@/features/workspace-members/api/workspace-members-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  WorkspaceMember,
  WorkspaceMemberInvitePayload,
  WorkspaceMemberUpdatePayload,
} from "./workspace-member.types";

export class WorkspaceMembersStore {
  members: WorkspaceMember[] = [];

  listLoading = false;
  listError: string | null = null;

  inviteLoading = false;
  updateLoadingMemberIds = new Set<number>();

  constructor() {
    makeAutoObservable(this);
  }

  get updatingMemberIds(): number[] {
    return Array.from(this.updateLoadingMemberIds);
  }

  get activeMembersCount(): number {
    return this.members.filter((member) => member.status === "active").length;
  }

  get inactiveMembersCount(): number {
    return this.members.filter((member) => member.status === "inactive").length;
  }

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

  updateMember = async (
    memberId: number,
    payload: WorkspaceMemberUpdatePayload,
  ): Promise<WorkspaceMember | null> => {
    runInAction(() => {
      this.updateLoadingMemberIds.add(memberId);
    });

    try {
      const member = await workspaceMembersApi.update(memberId, payload);
      await this.loadMembers({ silent: true });
      return member;
    } finally {
      runInAction(() => {
        this.updateLoadingMemberIds.delete(memberId);
      });
    }
  };
}
