import { makeAutoObservable, runInAction } from "mobx";

import { characteristicsApi } from "@/features/characteristics/api/characteristics-api";

import type {
  Characteristic,
  CharacteristicCreatePayload,
  CharacteristicUpdatePayload,
} from "@/features/characteristics/model/characteristic.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

function sortCharacteristics(items: Characteristic[]): Characteristic[] {
  return [...items].sort((left, right) => left.sortOrder - right.sortOrder);
}

export class CharacteristicsStore {
  workspaceId: number | null = null;
  items: Characteristic[] = [];

  listLoading = false;
  listError: string | null = null;

  saveLoading = false;
  deleteLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadCharacteristics = async (options?: {
    silent?: boolean;
  }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const result = await characteristicsApi.list();
      runInAction(() => {
        this.workspaceId = result.workspaceId;
        this.items = sortCharacteristics(result.items ?? []);
      });
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
        this.items = [];
      });
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  createCharacteristic = async (
    payload: CharacteristicCreatePayload,
  ): Promise<Characteristic> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const created = await characteristicsApi.create(payload);
      await this.loadCharacteristics({ silent: true });
      return created;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateCharacteristic = async (
    id: number,
    payload: CharacteristicUpdatePayload,
  ): Promise<Characteristic> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const updated = await characteristicsApi.update(id, payload);
      await this.loadCharacteristics({ silent: true });
      return updated;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  deleteCharacteristic = async (id: number): Promise<void> => {
    runInAction(() => {
      this.deleteLoadingId = id;
    });

    try {
      await characteristicsApi.delete(id);
      await this.loadCharacteristics({ silent: true });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };
}
