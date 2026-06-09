import { makeAutoObservable, runInAction } from "mobx";

import { messageTemplatesApi } from "@/features/message-templates/api/message-templates-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  MessageTemplate,
  MessageTemplateWritePayload,
} from "./message-template.types";

export class MessageTemplatesStore {
  templates: MessageTemplate[] = [];

  listLoading = false;
  listError: string | null = null;

  saveLoading = false;
  deleteLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadTemplates = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const items = await messageTemplatesApi.list();
      runInAction(() => {
        this.templates = items;
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

  createTemplate = async (
    payload: MessageTemplateWritePayload,
  ): Promise<MessageTemplate | null> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const created = await messageTemplatesApi.create(payload);
      await this.loadTemplates({ silent: true });

      if (created) {
        return created;
      }

      return (
        this.templates.find(
          (item) => item.name.trim() === payload.name.trim(),
        ) ?? null
      );
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateTemplate = async (
    id: number,
    payload: MessageTemplateWritePayload,
  ): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const updated = await messageTemplatesApi.update(id, payload);
      await this.loadTemplates({ silent: true });

      if (updated) {
        runInAction(() => {
          const index = this.templates.findIndex((item) => item.id === id);
          if (index >= 0) {
            this.templates[index] = updated;
          }
        });
      }
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  deleteTemplate = async (id: number): Promise<void> => {
    runInAction(() => {
      this.deleteLoadingId = id;
    });

    try {
      await messageTemplatesApi.delete(id);
      await this.loadTemplates({ silent: true });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };
}
