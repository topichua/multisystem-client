import { makeAutoObservable, runInAction } from "mobx";

import { automationApi } from "@/features/automation/api/automation-api";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  AutomationCriteria,
  AutomationRule,
  AutomationRuleCreatePayload,
  AutomationRulesListParams,
  AutomationRuleUpdatePayload,
} from "./automation.types";

export class AutomationStore {
  rules: AutomationRule[] = [];

  criteria: AutomationCriteria | null = null;

  listLoading = false;
  listError: string | null = null;

  criteriaLoading = false;
  criteriaError: string | null = null;

  detailLoading = false;
  detailError: string | null = null;
  currentRule: AutomationRule | null = null;

  saveLoading = false;
  deleteLoadingId: number | null = null;
  activeToggleLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadRules = async (
    params: AutomationRulesListParams = {},
    options?: { silent?: boolean },
  ): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const items = await automationApi.list({
        isActive: params.isActive,
        sourceType: params.sourceType,
      });

      runInAction(() => {
        this.rules = items;
        this.listError = null;
      });
    } catch (error) {
      runInAction(() => {
        this.listError = unknownErrorMessage(error);
      });
      throwLoadError("Failed to load automation rules", error);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  loadCriteria = async (options?: {
    silent?: boolean;
    force?: boolean;
  }): Promise<void> => {
    if (this.criteria && !options?.force) {
      return;
    }

    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.criteriaLoading = true;
        this.criteriaError = null;
      });
    }

    try {
      const criteria = await automationApi.getCriteria();
      runInAction(() => {
        this.criteria = criteria;
        this.criteriaError = null;
      });
    } catch (error) {
      runInAction(() => {
        this.criteriaError = unknownErrorMessage(error);
      });
      throwLoadError("Failed to load automation criteria", error);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.criteriaLoading = false;
        });
      }
    }
  };

  loadRule = async (
    id: number,
    options?: { silent?: boolean },
  ): Promise<AutomationRule | null> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.detailLoading = true;
        this.detailError = null;
      });
    }

    try {
      const rule = await automationApi.getById(id);
      runInAction(() => {
        this.currentRule = rule;
        this.detailError = null;

        const index = this.rules.findIndex((item) => item.id === id);
        if (index >= 0) {
          this.rules[index] = rule;
        }
      });
      return rule;
    } catch (error) {
      runInAction(() => {
        this.currentRule = null;
        this.detailError = unknownErrorMessage(error);
      });
      throwLoadError("Failed to load automation rule", error);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.detailLoading = false;
        });
      }
    }
  };

  createRule = async (
    payload: AutomationRuleCreatePayload,
  ): Promise<AutomationRule> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const created = await automationApi.create(payload);
      await this.loadRules({}, { silent: true });
      return created;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateRule = async (
    id: number,
    payload: AutomationRuleUpdatePayload,
  ): Promise<AutomationRule> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const updated = await automationApi.update(id, payload);
      runInAction(() => {
        this.currentRule = updated;
        const index = this.rules.findIndex((item) => item.id === id);
        if (index >= 0) {
          this.rules[index] = updated;
        }
      });
      return updated;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  setRuleActive = async (
    id: number,
    isActive: boolean,
  ): Promise<AutomationRule> => {
    runInAction(() => {
      this.activeToggleLoadingId = id;
    });

    try {
      const updated = await automationApi.setActive(id, isActive);
      runInAction(() => {
        const index = this.rules.findIndex((item) => item.id === id);
        if (index >= 0) {
          this.rules[index] = updated;
        }
        if (this.currentRule?.id === id) {
          this.currentRule = updated;
        }
      });
      return updated;
    } finally {
      runInAction(() => {
        this.activeToggleLoadingId = null;
      });
    }
  };

  deleteRule = async (id: number): Promise<void> => {
    runInAction(() => {
      this.deleteLoadingId = id;
    });

    try {
      await automationApi.delete(id);
      runInAction(() => {
        this.rules = this.rules.filter((item) => item.id !== id);
        if (this.currentRule?.id === id) {
          this.currentRule = null;
        }
      });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };

  clearCurrentRule = (): void => {
    this.currentRule = null;
    this.detailError = null;
  };
}
