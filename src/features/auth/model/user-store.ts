import { makeAutoObservable, runInAction } from "mobx";

import { authApi } from "@/features/auth/api/auth-api";

import type { AuthSessionResponse } from "./auth-session.types";

const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Something went wrong";

export class UserStore {
  session: AuthSessionResponse | null = null;
  sessionLoading = false;
  sessionError: string | null = null;

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

  loadAuth = (): Promise<void> => {
    runInAction(() => {
      this.sessionLoading = true;
      this.sessionError = null;
    });

    return authApi
      .getSession()
      .then((data) => {
        runInAction(() => {
          this.session = data;
        });
      })
      .catch((e) => {
        runInAction(() => {
          this.sessionError = errorMessage(e);
        });
      })
      .finally(() => {
        runInAction(() => {
          this.sessionLoading = false;
        });
      })
      .then(() => undefined);
  };

  clearSession() {
    this.session = null;
    this.sessionError = null;
    this.sessionLoading = false;
  }
}
