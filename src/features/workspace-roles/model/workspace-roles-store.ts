import { makeAutoObservable, runInAction } from "mobx";

import { workspaceRolesApi } from "@/features/workspace-roles/api/workspace-roles-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  WorkspacePermissionsCatalogSchema,
  WorkspaceRole,
  WorkspaceRoleCreatePayload,
  WorkspaceRoleIntegrationGrant,
  WorkspaceRoleIntegrationGrantsUpdatePayload,
  WorkspaceRoleUpdatePayload,
} from "./workspace-role.types";

const EMPTY_INTEGRATION_GRANTS: WorkspaceRoleIntegrationGrant[] = [];

export class WorkspaceRolesStore {
  roles: WorkspaceRole[] = [];
  catalog: WorkspacePermissionsCatalogSchema | null = null;
  integrationGrantsByRoleId = new Map<number, WorkspaceRoleIntegrationGrant[]>();
  integrationGrantsErrorByRoleId = new Map<number, string>();

  listLoading = false;
  listError: string | null = null;

  catalogLoading = false;
  catalogError: string | null = null;

  integrationGrantsLoadingRoleId: number | null = null;
  integrationGrantsSaveLoadingRoleId: number | null = null;

  saveLoading = false;
  deleteLoadingId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get sortedRoles(): WorkspaceRole[] {
    return [...this.roles].sort((a, b) => a.id - b.id);
  }

  findRole = (roleId: number): WorkspaceRole | undefined =>
    this.roles.find((role) => role.id === roleId);

  getIntegrationGrants = (roleId: number): WorkspaceRoleIntegrationGrant[] =>
    this.integrationGrantsByRoleId.get(roleId) ?? EMPTY_INTEGRATION_GRANTS;

  hasLoadedIntegrationGrants = (roleId: number): boolean =>
    this.integrationGrantsByRoleId.has(roleId);

  isIntegrationGrantsLoading = (roleId: number): boolean =>
    this.integrationGrantsLoadingRoleId === roleId;

  getIntegrationGrantsError = (roleId: number): string | null =>
    this.integrationGrantsErrorByRoleId.get(roleId) ?? null;

  loadInitialData = async (): Promise<void> => {
    await Promise.all([this.loadRoles(), this.loadCatalog()]);
  };

  loadCatalog = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.catalogLoading = true;
        this.catalogError = null;
      });
    }

    try {
      const { schema } = await workspaceRolesApi.getPermissionsCatalog();

      runInAction(() => {
        this.catalog = schema;
        this.catalogError = null;
      });
    } catch (e) {
      runInAction(() => {
        this.catalogError = unknownErrorMessage(e);
      });
    } finally {
      if (!silent) {
        runInAction(() => {
          this.catalogLoading = false;
        });
      }
    }
  };

  loadRoles = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const items = await workspaceRolesApi.list();

      runInAction(() => {
        this.roles = items;
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

  loadIntegrationGrants = async (
    roleId: number,
    options?: { silent?: boolean },
  ): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.integrationGrantsLoadingRoleId = roleId;
        this.integrationGrantsErrorByRoleId.delete(roleId);
      });
    }

    try {
      const grants = await workspaceRolesApi.getIntegrationGrants(roleId);

      runInAction(() => {
        this.integrationGrantsByRoleId.set(roleId, grants);
        this.integrationGrantsErrorByRoleId.delete(roleId);
      });
    } catch (e) {
      runInAction(() => {
        this.integrationGrantsErrorByRoleId.set(roleId, unknownErrorMessage(e));
      });
    } finally {
      if (!silent) {
        runInAction(() => {
          if (this.integrationGrantsLoadingRoleId === roleId) {
            this.integrationGrantsLoadingRoleId = null;
          }
        });
      }
    }
  };

  createRole = async (payload: WorkspaceRoleCreatePayload): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      await workspaceRolesApi.create(payload);
      await this.loadRoles({ silent: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateRole = async (
    roleId: number,
    payload: WorkspaceRoleUpdatePayload,
  ): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
    });

    try {
      await workspaceRolesApi.update(roleId, payload);
      await this.loadRoles({ silent: true });
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };

  updateRoleWithIntegrationGrants = async (
    roleId: number,
    rolePayload: WorkspaceRoleUpdatePayload,
    integrationGrantsPayload?: WorkspaceRoleIntegrationGrantsUpdatePayload,
  ): Promise<void> => {
    runInAction(() => {
      this.saveLoading = true;
      if (integrationGrantsPayload) {
        this.integrationGrantsSaveLoadingRoleId = roleId;
      }
    });

    try {
      await workspaceRolesApi.update(roleId, rolePayload);

      if (integrationGrantsPayload) {
        await workspaceRolesApi.updateIntegrationGrants(
          roleId,
          integrationGrantsPayload,
        );
      }

      await Promise.all([
        this.loadRoles({ silent: true }),
        integrationGrantsPayload
          ? this.loadIntegrationGrants(roleId, { silent: true })
          : Promise.resolve(),
      ]);
    } finally {
      runInAction(() => {
        this.saveLoading = false;
        if (this.integrationGrantsSaveLoadingRoleId === roleId) {
          this.integrationGrantsSaveLoadingRoleId = null;
        }
      });
    }
  };

  deleteRole = async (roleId: number): Promise<void> => {
    runInAction(() => {
      this.deleteLoadingId = roleId;
    });

    try {
      await workspaceRolesApi.delete(roleId);
      await this.loadRoles({ silent: true });
    } finally {
      runInAction(() => {
        this.deleteLoadingId = null;
      });
    }
  };
}
