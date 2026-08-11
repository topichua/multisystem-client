import { makeAutoObservable, runInAction } from "mobx";

import { authApi } from "@/features/auth/api/auth-api";
import type { MemberWorkStatus } from "@/features/auth/model/auth-session.types";
import { workspaceMembersApi } from "@/features/workspace-members/api/workspace-members-api";

import type { AuthSessionResponse } from "./auth-session.types";

const DEFAULT_WORK_STATUS: MemberWorkStatus = "not_accepting_new_chats";

export class UserStore {
  session: AuthSessionResponse | null = null;
  workStatusUpdating = false;

  constructor() {
    makeAutoObservable(this);
  }

  get user() {
    return this.session?.user ?? null;
  }

  get company() {
    return this.session?.company ?? null;
  }

  get role() {
    return this.session?.role ?? null;
  }

  get isWorkspaceOwner() {
    return (
      this.session?.workspaceRole?.isOwner === true ||
      this.session?.permissions?.isOwner === true
    );
  }

  get workStatus(): MemberWorkStatus {
    return this.session?.work_status ?? DEFAULT_WORK_STATUS;
  }

  get displayName(): string | null {
    const u = this.session?.user;
    if (!u) {
      return null;
    }
    const last =
      typeof u.lastName === "string" && u.lastName.trim()
        ? u.lastName.trim()
        : "";
    const first = u.firstName?.trim() ?? "";
    const full = [first, last].filter(Boolean).join(" ").trim();
    return full || u.email;
  }

  loadAuth = (): Promise<void> =>
    authApi
      .getSession()
      .then((data) => {
        runInAction(() => {
          this.session = data;
        });
      })
      .catch(() => {
        runInAction(() => {
          this.session = null;
        });
      })
      .then(() => undefined);

  updateWorkStatus = async (workStatus: MemberWorkStatus): Promise<void> => {
    if (!this.session || this.session.work_status === workStatus) {
      return;
    }

    const previous = this.session.work_status ?? DEFAULT_WORK_STATUS;

    runInAction(() => {
      this.workStatusUpdating = true;
      if (this.session) {
        this.session = { ...this.session, work_status: workStatus };
      }
    });

    try {
      const next = await workspaceMembersApi.updateMyWorkStatus(workStatus);
      runInAction(() => {
        if (this.session) {
          this.session = { ...this.session, work_status: next };
        }
      });
    } catch (error) {
      runInAction(() => {
        if (this.session) {
          this.session = { ...this.session, work_status: previous };
        }
      });
      throw error;
    } finally {
      runInAction(() => {
        this.workStatusUpdating = false;
      });
    }
  };

  clearSession() {
    this.session = null;
  }
}
