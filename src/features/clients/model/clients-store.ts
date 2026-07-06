import { makeAutoObservable, runInAction } from "mobx";

import { clientsApi } from "@/features/clients/api/clients-api";

import type {
  Client,
  ClientCreatePayload,
  ClientLookupResponse,
  ClientsListQueryParams,
  ClientsLookupParams,
  ClientUpdatePayload,
} from "@/features/clients/model/client.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";
import { throwLoadError } from "@/utils/throw-load-error";

export type ClientsListLoadOptions = Pick<
  ClientsListQueryParams,
  "page" | "pageSize" | "include_order_stat"
>;

export class ClientsStore {
  clients: Client[] = [];
  activeClient: Client | null = null;

  listTotal = 0;
  listPage = 1;
  listPageSize = 50;

  listLoading = false;
  listError: string | null = null;

  saveLoading = false;
  deleteLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadClients = async (
    options?: ClientsListLoadOptions & { silent?: boolean },
  ): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const response = await clientsApi.listClients({
        page: options?.page ?? this.listPage,
        pageSize: options?.pageSize ?? this.listPageSize,
        include_order_stat: options?.include_order_stat ?? true,
      });

      runInAction(() => {
        this.clients = response.items;
        this.listTotal = response.total;
        this.listPage = response.page;
        this.listPageSize = response.pageSize;
      });
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
      });
      throwLoadError("Failed to load clients", e);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  lookupClient = async (
    params: ClientsLookupParams,
  ): Promise<ClientLookupResponse> => clientsApi.lookupClient(params);

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

  updateClient = async (
    id: number,
    payload: ClientUpdatePayload,
  ): Promise<void> => {
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
