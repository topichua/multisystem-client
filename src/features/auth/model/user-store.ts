import { makeAutoObservable, runInAction } from "mobx";

import { authApi } from "@/features/auth/api/auth-api";

import type { AuthSessionResponse } from "./auth-session.types";

export class UserStore {
  session: AuthSessionResponse | null = null;

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
    return this.session?.workspaceRole?.isOwner === true;
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

  clearSession() {
    this.session = null;
  }
}
