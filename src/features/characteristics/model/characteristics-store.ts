import { makeAutoObservable, runInAction } from "mobx";

import { characteristicsApi } from "@/features/characteristics/api/characteristics-api";

import type {
  Characteristic,
  CharacteristicCreatePayload,
  CharacteristicDetail,
  CharacteristicLibraryInstallGroupPayload,
  CharacteristicLibraryInstallGroupResponse,
  CharacteristicLibraryInstallPayload,
  CharacteristicLibraryInstallResponse,
  CharacteristicOptionPayload,
  CharacteristicUpdatePayload,
} from "@/features/characteristics/model/characteristic.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";
import { throwLoadError } from "@/utils/throw-load-error";

const sortCharacteristics = (items: Characteristic[]): Characteristic[] =>
  [...items].sort((left, right) => left.sortOrder - right.sortOrder);

export class CharacteristicsStore {
  items: Characteristic[] = [];
  activeCharacteristic: CharacteristicDetail | null = null;

  listLoading = false;

  detailLoading = false;
  detailError: string | null = null;
  detailRequestId = 0;

  saveLoading = false;
  deleteLoadingId: number | null = null;
  archiveLoadingId: number | null = null;
  optionDeleteLoadingId: number | null = null;
  optionArchiveLoadingId: number | null = null;

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
      });
    }

    try {
      const result = await characteristicsApi.list();
      runInAction(() => {
        this.items = sortCharacteristics(result.items ?? []);
      });
    } catch (e) {
      runInAction(() => {
        this.items = [];
      });
      throwLoadError("Failed to load characteristics", e);
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
      let stale = false;

      runInAction(() => {
        if (requestId !== this.detailRequestId) {
          stale = true;
          return;
        }

        this.detailError = unknownErrorMessage(e);
      });

      if (!stale) {
        throwLoadError(`Failed to load characteristic ${id}`, e);
      }
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

  installLibraryField = async (
    payload: CharacteristicLibraryInstallPayload,
  ): Promise<CharacteristicLibraryInstallResponse> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const result = await characteristicsApi.installFromLibrary(payload);
      await this.loadCharacteristics({ silent: true });
      return result;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  installLibraryGroup = async (
    payload: CharacteristicLibraryInstallGroupPayload,
  ): Promise<CharacteristicLibraryInstallGroupResponse> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const result = await characteristicsApi.installGroupFromLibrary(payload);
      await this.loadCharacteristics({ silent: true });
      return result;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  installLibraryGroups = async (groupKeys: string[]): Promise<number> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      let installedCount = 0;

      for (const groupKey of groupKeys) {
        const result = await characteristicsApi.installGroupFromLibrary({
          groupKey,
        });
        installedCount += result.installed.length;
      }

      await this.loadCharacteristics({ silent: true });
      return installedCount;
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

  archiveCharacteristic = async (id: number): Promise<void> => {
    await this.runCharacteristicArchiveMutation(id, () =>
      characteristicsApi.archive(id),
    );
  };

  unarchiveCharacteristic = async (id: number): Promise<void> => {
    await this.runCharacteristicArchiveMutation(id, () =>
      characteristicsApi.unarchive(id),
    );
  };

  archiveCharacteristicOption = async (
    characteristicId: number,
    optionId: number,
  ): Promise<void> => {
    await this.runCharacteristicOptionArchiveMutation(
      characteristicId,
      optionId,
      () => characteristicsApi.archiveOption(characteristicId, optionId),
    );
  };

  unarchiveCharacteristicOption = async (
    characteristicId: number,
    optionId: number,
  ): Promise<void> => {
    await this.runCharacteristicOptionArchiveMutation(
      characteristicId,
      optionId,
      () => characteristicsApi.unarchiveOption(characteristicId, optionId),
    );
  };

  private runCharacteristicArchiveMutation = async (
    id: number,
    mutate: () => Promise<void>,
  ): Promise<void> => {
    runInAction(() => {
      this.archiveLoadingId = id;
    });

    try {
      await mutate();
      await this.loadCharacteristicById(id, { silent: true });
      await this.loadCharacteristics({ silent: true });
    } finally {
      runInAction(() => {
        this.archiveLoadingId = null;
      });
    }
  };

  private runCharacteristicOptionArchiveMutation = async (
    characteristicId: number,
    optionId: number,
    mutate: () => Promise<void>,
  ): Promise<void> => {
    runInAction(() => {
      this.optionArchiveLoadingId = optionId;
    });

    try {
      await mutate();
      await this.loadCharacteristicById(characteristicId, { silent: true });
      await this.loadCharacteristics({ silent: true });
    } finally {
      runInAction(() => {
        this.optionArchiveLoadingId = null;
      });
    }
  };
}
