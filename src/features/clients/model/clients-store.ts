import { makeAutoObservable, runInAction } from 'mobx';

import { clientsApi } from '@/features/clients/api/clients-api';

import type {
  Client,
  ClientCreatePayload,
  ClientUpdatePayload,
} from '@/features/clients/model/client.types';
import { unknownErrorMessage } from '@/utils/unknown-error-message';

export class ClientsStore {
  clients: Client[] = [];
  activeClient: Client | null = null;

  listLoading = false;
  listError: string | null = null;

  detailLoading = false;
  detailError: string | null = null;

  saveLoading = false;
  deleteLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadClients = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const items = await clientsApi.list();
      runInAction(() => {
        this.clients = items;
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

  loadClientById = async (id: number): Promise<void> => {
    runInAction(() => {
      this.detailLoading = true;
      this.detailError = null;
    });

    try {
      const data = await clientsApi.getById(id);
      runInAction(() => {
        this.activeClient = data;
      });
    } catch (e) {
      runInAction(() => {
        this.detailError = unknownErrorMessage(e);
      });
    } finally {
      runInAction(() => {
        this.detailLoading = false;
      });
    }
  };

  createClient = async (payload: ClientCreatePayload): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const created = await clientsApi.create(payload);
      runInAction(() => {
        this.activeClient = created;
      });
      await this.loadClients({ silent: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateClient = async (id: number, payload: ClientUpdatePayload): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      const updated = await clientsApi.update(id, payload);
      runInAction(() => {
        this.activeClient = updated;
      });
      await this.loadClients({ silent: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  deleteClient = async (id: number): Promise<void> => {
    runInAction(() => {
      this.deleteLoadingId = id;
    });

    try {
      await clientsApi.delete(id);
      runInAction(() => {
        if (this.activeClient?.id === id) {
          this.activeClient = null;
        }
      });
      await this.loadClients({ silent: true });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };
}
