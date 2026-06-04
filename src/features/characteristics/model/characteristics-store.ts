import { makeAutoObservable, runInAction } from "mobx";

import { characteristicsApi } from "@/features/characteristics/api/characteristics-api";

import type {
  Characteristic,
  CharacteristicCreatePayload,
  CharacteristicDetail,
  CharacteristicOptionPayload,
  CharacteristicUpdatePayload,
} from "@/features/characteristics/model/characteristic.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

function sortCharacteristics(items: Characteristic[]): Characteristic[] {
  return [...items].sort((left, right) => left.sortOrder - right.sortOrder);
}

export class CharacteristicsStore {
  workspaceId: number | null = null;
  items: Characteristic[] = [];
  activeCharacteristic: CharacteristicDetail | null = null;

  listLoading = false;
  listError: string | null = null;

  detailLoading = false;
  detailError: string | null = null;
  detailRequestId = 0;

  saveLoading = false;
  deleteLoadingId: number | null = null;
  optionDeleteLoadingId: number | null = null;

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
        this.listError = null;
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

  loadCharacteristicById = async (
    id: number,
    options?: { silent?: boolean },
  ): Promise<void> => {
    const silent = options?.silent === true;
    const requestId = this.detailRequestId + 1;
    this.detailRequestId = requestId;

    if (!silent) {
      runInAction(() => {
        this.detailLoading = true;
        this.detailError = null;
      });
    }

    try {
      const data = await characteristicsApi.getById(id);
      runInAction(() => {
        if (requestId !== this.detailRequestId) {
          return;
        }

        this.activeCharacteristic = data;
        this.detailError = null;
      });
    } catch (e) {
      runInAction(() => {
        if (requestId !== this.detailRequestId) {
          return;
        }

        this.detailError = unknownErrorMessage(e);
      });
    } finally {
      runInAction(() => {
        if (requestId !== this.detailRequestId) {
          return;
        }

        this.detailLoading = false;
      });
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
      await this.loadCharacteristicById(id, { silent: true });
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
      runInAction(() => {
        if (this.activeCharacteristic?.id === id) {
          this.activeCharacteristic = null;
        }
      });
      await this.loadCharacteristics({ silent: true });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };

  createCharacteristicOption = async (
    characteristicId: number,
    payload: CharacteristicOptionPayload,
  ): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      await characteristicsApi.createOption(characteristicId, payload);
      await this.loadCharacteristicById(characteristicId, { silent: true });
      await this.loadCharacteristics({ silent: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateCharacteristicOption = async (
    characteristicId: number,
    optionId: number,
    payload: CharacteristicOptionPayload,
  ): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      await characteristicsApi.updateOption(
        characteristicId,
        optionId,
        payload,
      );
      await this.loadCharacteristicById(characteristicId, { silent: true });
      await this.loadCharacteristics({ silent: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  deleteCharacteristicOption = async (
    characteristicId: number,
    optionId: number,
  ): Promise<void> => {
    runInAction(() => {
      this.optionDeleteLoadingId = optionId;
    });

    try {
      await characteristicsApi.deleteOption(characteristicId, optionId);
      await this.loadCharacteristicById(characteristicId, { silent: true });
      await this.loadCharacteristics({ silent: true });
    } finally {
      runInAction(() => {
        this.optionDeleteLoadingId = null;
      });
    }
  };
}
