import { makeAutoObservable, runInAction } from "mobx";

import { clientsApi } from "@/features/clients/api/clients-api";

import type {
  Client,
  ClientCreatePayload,
  ClientsBlockedFilter,
  ClientLookupResponse,
  ClientsListQueryParams,
  ClientsLookupParams,
  ClientUpdatePayload,
} from "@/features/clients/model/client.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";
import { throwLoadError } from "@/utils/throw-load-error";

const defaultPageSize = 50;

export type ClientsListLoadOptions = Pick<
  ClientsListQueryParams,
  | "page"
  | "pageSize"
  | "include_order_stat"
  | "keyword"
  | "blocked"
  | "createdFrom"
  | "createdTo"
  | "lastOrderFrom"
  | "lastOrderTo"
>;

export class ClientsStore {
  clients: Client[] = [];
  activeClient: Client | null = null;

  listTotal = 0;
  listPage = 1;
  listPageSize = defaultPageSize;
  listKeyword = "";
  listBlocked: ClientsBlockedFilter = "all";
  listCreatedFrom: string | null = null;
  listCreatedTo: string | null = null;
  listLastOrderFrom: string | null = null;
  listLastOrderTo: string | null = null;

  draftBlocked: ClientsBlockedFilter = "all";
  draftCreatedFrom: string | null = null;
  draftCreatedTo: string | null = null;
  draftLastOrderFrom: string | null = null;
  draftLastOrderTo: string | null = null;

  listLoading = false;
  listError: string | null = null;

  saveLoading = false;
  deleteLoadingId: number | null = null;
  blockLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get appliedNonKeywordFilterCount(): number {
    let count = this.listBlocked === "all" ? 0 : 1;

    if (this.listCreatedFrom != null || this.listCreatedTo != null) {
      count += 1;
    }

    if (this.listLastOrderFrom != null || this.listLastOrderTo != null) {
      count += 1;
    }

    return count;
  }

  syncFilterDraftFromApplied = (): void => {
    runInAction(() => {
      this.draftBlocked = this.listBlocked;
      this.draftCreatedFrom = this.listCreatedFrom;
      this.draftCreatedTo = this.listCreatedTo;
      this.draftLastOrderFrom = this.listLastOrderFrom;
      this.draftLastOrderTo = this.listLastOrderTo;
    });
  };

  resetFilterDraft = (): void => {
    runInAction(() => {
      this.draftBlocked = "all";
      this.draftCreatedFrom = null;
      this.draftCreatedTo = null;
      this.draftLastOrderFrom = null;
      this.draftLastOrderTo = null;
    });
  };

  setDraftBlocked = (value: ClientsBlockedFilter): void => {
    runInAction(() => {
      this.draftBlocked = value;
    });
  };

  setDraftCreatedFrom = (value: string | null): void => {
    runInAction(() => {
      this.draftCreatedFrom = value;
    });
  };

  setDraftCreatedTo = (value: string | null): void => {
    runInAction(() => {
      this.draftCreatedTo = value;
    });
  };

  setDraftLastOrderFrom = (value: string | null): void => {
    runInAction(() => {
      this.draftLastOrderFrom = value;
    });
  };

  setDraftLastOrderTo = (value: string | null): void => {
    runInAction(() => {
      this.draftLastOrderTo = value;
    });
  };

  applyFiltersFromPanel = (): void => {
    runInAction(() => {
      this.listBlocked = this.draftBlocked;
      this.listCreatedFrom = this.draftCreatedFrom;
      this.listCreatedTo = this.draftCreatedTo;
      this.listLastOrderFrom = this.draftLastOrderFrom;
      this.listLastOrderTo = this.draftLastOrderTo;
      this.listPage = 1;
    });
  };

  setListKeyword = (value: string): void => {
    const applied = value.trim();
    if (applied === this.listKeyword) {
      return;
    }

    runInAction(() => {
      this.listKeyword = applied;
      this.listPage = 1;
    });
  };

  setListPage = (nextPage: number): void => {
    const safe = Math.max(1, nextPage);

    runInAction(() => {
      this.listPage = safe;
    });
  };

  private buildListQueryParams(
    options?: ClientsListLoadOptions,
  ): ClientsListQueryParams {
    const hasQueryOverrides =
      options != null &&
      (options.page != null ||
        options.pageSize != null ||
        options.include_order_stat != null ||
        options.keyword != null ||
        options.blocked != null ||
        options.createdFrom != null ||
        options.createdTo != null ||
        options.lastOrderFrom != null ||
        options.lastOrderTo != null);

    const keyword = hasQueryOverrides
      ? options?.keyword?.trim()
      : this.listKeyword;
    const blocked = hasQueryOverrides ? options?.blocked : this.listBlocked;
    const createdFrom = hasQueryOverrides
      ? options?.createdFrom
      : (this.listCreatedFrom ?? undefined);
    const createdTo = hasQueryOverrides
      ? options?.createdTo
      : (this.listCreatedTo ?? undefined);
    const lastOrderFrom = hasQueryOverrides
      ? options?.lastOrderFrom
      : (this.listLastOrderFrom ?? undefined);
    const lastOrderTo = hasQueryOverrides
      ? options?.lastOrderTo
      : (this.listLastOrderTo ?? undefined);

    return {
      page: hasQueryOverrides ? (options?.page ?? 1) : this.listPage,
      pageSize: hasQueryOverrides
        ? (options?.pageSize ?? defaultPageSize)
        : this.listPageSize,
      include_order_stat: options?.include_order_stat ?? true,
      ...(keyword ? { keyword } : {}),
      ...(blocked && blocked !== "all" ? { blocked } : {}),
      ...(createdFrom ? { createdFrom } : {}),
      ...(createdTo ? { createdTo } : {}),
      ...(lastOrderFrom ? { lastOrderFrom } : {}),
      ...(lastOrderTo ? { lastOrderTo } : {}),
    };
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
      const response = await clientsApi.listClients(
        this.buildListQueryParams(options),
      );

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

  setClientBlocked = async (id: number, blocked: boolean): Promise<void> => {
    runInAction(() => {
      this.blockLoadingId = id;
    });

    try {
      if (blocked) {
        await clientsApi.block(id);
      } else {
        await clientsApi.unblock(id);
      }

      runInAction(() => {
        if (this.activeClient?.id === id) {
          this.activeClient = { ...this.activeClient, blocked };
        }
      });

      await this.loadClients({ silent: true });
    } finally {
      runInAction(() => {
        this.blockLoadingId = null;
      });
    }
  };
}
