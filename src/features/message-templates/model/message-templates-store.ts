import { makeAutoObservable, runInAction } from "mobx";

import { messageTemplatesApi } from "@/features/message-templates/api/message-templates-api";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  MessageTemplate,
  MessageTemplateListFilter,
  MessageTemplateRenderPayload,
  MessageTemplateType,
  MessageTemplateVariable,
  MessageTemplateWritePayload,
} from "./message-template.types";
import { toVariablesByType } from "./message-template.utils";

const TEMPLATE_NAME_COLLATOR = new Intl.Collator(undefined, {
  sensitivity: "base",
});

export class MessageTemplatesStore {
  templates: MessageTemplate[] = [];
  typeFilter: MessageTemplateListFilter = "all";
  variablesByType: Record<MessageTemplateType, MessageTemplateVariable[]> = {
    chat: [],
    order: [],
  };

  listLoading = false;
  listError: string | null = null;
  listRequestId = 0;
  listType: MessageTemplateListFilter = "all";

  saveLoading = false;
  deleteLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setTypeFilter = (filter: MessageTemplateListFilter): void => {
    this.typeFilter = filter;
  };

  revealTemplateType = (type: MessageTemplateType): void => {
    if (this.typeFilter !== "all" && this.typeFilter !== type) {
      this.typeFilter = type;
    }
  };

  getVariablesForType = (
    type: MessageTemplateType,
  ): MessageTemplateVariable[] => this.variablesByType[type];

  get visibleTemplates(): MessageTemplate[] {
    if (this.typeFilter === "all") {
      return this.templates;
    }

    return this.templates.filter((item) => item.type === this.typeFilter);
  }

  get sortedVisibleTemplates(): MessageTemplate[] {
    return [...this.visibleTemplates].sort((a, b) =>
      TEMPLATE_NAME_COLLATOR.compare(a.name, b.name),
    );
  }

  loadTemplates = async (options?: {
    silent?: boolean;
    type?: MessageTemplateType;
  }): Promise<void> => {
    const silent = options?.silent === true;
    const requestId = ++this.listRequestId;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const items = await messageTemplatesApi.list(options?.type);

      if (requestId !== this.listRequestId) {
        return;
      }

      runInAction(() => {
        this.templates = items;
        this.listType = options?.type ?? "all";
        this.listError = null;
      });
    } catch (e) {
      if (requestId !== this.listRequestId) {
        return;
      }

      runInAction(() => {
        this.listError = unknownErrorMessage(e);
      });
      throwLoadError("Failed to load message templates", e);
    } finally {
      if (!silent && requestId === this.listRequestId) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  loadVariables = async (): Promise<void> => {
    try {
      const groups = await messageTemplatesApi.getVariables();

      runInAction(() => {
        this.variablesByType = toVariablesByType(groups);
      });
    } catch {
      runInAction(() => {
        this.variablesByType = { chat: [], order: [] };
      });
    }
  };

  renderTemplate = async (
    templateId: number,
    payload: MessageTemplateRenderPayload,
  ): Promise<string | null> => {
    const rendered = await messageTemplatesApi.render(templateId, payload);

    return rendered?.text ?? null;
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
