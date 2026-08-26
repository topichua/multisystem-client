import { makeAutoObservable, runInAction } from "mobx";

import { conversationGroupsApi } from "@/features/conversation-groups/api/conversation-groups-api";
import { throwLoadError } from "@/utils/throw-load-error";

import type {
  ConversationGroup,
  ConversationGroupWritePayload,
} from "./conversation-group.types";

type LoadConversationGroupsOptions = {
  silent?: boolean;
  includeDistribution?: boolean;
};

export class ConversationGroupsStore {
  groups: ConversationGroup[] = [];
  totalConversations = 0;
  listLoading = false;

  saveLoading = false;
  deleteLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get nextSortOrder(): number {
    if (this.groups.length === 0) {
      return 1;
    }

    return Math.max(...this.groups.map((g) => g.sortOrder)) + 1;
  }

  loadGroups = async (
    options?: LoadConversationGroupsOptions,
  ): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
      });
    }

    try {
      const { groups, totalConversations } = await conversationGroupsApi.list({
        includeDistribution: options?.includeDistribution,
      });
      runInAction(() => {
        this.groups = groups;
        this.totalConversations = totalConversations;
      });
    } catch (e) {
      runInAction(() => {
        this.groups = [];
        this.totalConversations = 0;
      });
      throwLoadError("Failed to load conversation groups", e);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  createGroup = async (
    payload: ConversationGroupWritePayload,
  ): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      await conversationGroupsApi.create(payload);
      await this.loadGroups({ silent: true, includeDistribution: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateGroup = async (
    id: number,
    payload: ConversationGroupWritePayload,
  ): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      await conversationGroupsApi.update(id, payload);
      await this.loadGroups({ silent: true, includeDistribution: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  deleteGroup = async (id: number): Promise<void> => {
    runInAction(() => {
      this.deleteLoadingId = id;
    });

    try {
      await conversationGroupsApi.delete(id);
      await this.loadGroups({ silent: true, includeDistribution: true });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };
}
