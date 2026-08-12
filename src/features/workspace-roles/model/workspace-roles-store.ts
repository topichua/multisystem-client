import { makeAutoObservable, runInAction } from "mobx";

import { workspaceRolesApi } from "@/features/workspace-roles/api/workspace-roles-api";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  WorkspacePermissionsCatalogSchema,
  WorkspaceRole,
  WorkspaceRoleCreatePayload,
  WorkspaceRoleIntegrationGrant,
  WorkspaceRoleIntegrationGrantsUpdatePayload,
  WorkspaceRoleProductReferenceGrant,
  WorkspaceRoleProductReferenceGrantsUpdatePayload,
  WorkspaceRoleUpdatePayload,
} from "./workspace-role.types";

const EMPTY_INTEGRATION_GRANTS: WorkspaceRoleIntegrationGrant[] = [];
const EMPTY_PRODUCT_REFERENCE_GRANTS: WorkspaceRoleProductReferenceGrant[] = [];

export class WorkspaceRolesStore {
  roles: WorkspaceRole[] = [];
  catalog: WorkspacePermissionsCatalogSchema | null = null;
  integrationGrantsByRoleId = new Map<
    number,
    WorkspaceRoleIntegrationGrant[]
  >();
  integrationGrantsErrorByRoleId = new Map<number, string>();
  productReferenceGrantsByRoleId = new Map<
    number,
    WorkspaceRoleProductReferenceGrant[]
  >();
  productReferenceGrantsErrorByRoleId = new Map<number, string>();

  listLoading = false;
  listError: string | null = null;

  catalogLoading = false;
  catalogError: string | null = null;

  integrationGrantsLoadingRoleId: number | null = null;
  integrationGrantsSaveLoadingRoleId: number | null = null;
  productReferenceGrantsLoadingRoleId: number | null = null;
  productReferenceGrantsSaveLoadingRoleId: number | null = null;

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

  getProductReferenceGrants = (
    roleId: number,
  ): WorkspaceRoleProductReferenceGrant[] =>
    this.productReferenceGrantsByRoleId.get(roleId) ??
    EMPTY_PRODUCT_REFERENCE_GRANTS;

  hasLoadedProductReferenceGrants = (roleId: number): boolean =>
    this.productReferenceGrantsByRoleId.has(roleId);

  isProductReferenceGrantsLoading = (roleId: number): boolean =>
    this.productReferenceGrantsLoadingRoleId === roleId;

  getProductReferenceGrantsError = (roleId: number): string | null =>
    this.productReferenceGrantsErrorByRoleId.get(roleId) ?? null;

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
      throwLoadError("Failed to load workspace permissions catalog", e);
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
      throwLoadError("Failed to load workspace roles", e);
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
      throwLoadError(`Failed to load integration grants for role ${roleId}`, e);
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

  loadProductReferenceGrants = async (
    roleId: number,
    options?: { silent?: boolean },
  ): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.productReferenceGrantsLoadingRoleId = roleId;
        this.productReferenceGrantsErrorByRoleId.delete(roleId);
      });
    }

    try {
      const grants = await workspaceRolesApi.getProductReferenceGrants(roleId);

      runInAction(() => {
        this.productReferenceGrantsByRoleId.set(roleId, grants);
        this.productReferenceGrantsErrorByRoleId.delete(roleId);
      });
    } catch (e) {
      runInAction(() => {
        this.productReferenceGrantsErrorByRoleId.set(
          roleId,
          unknownErrorMessage(e),
        );
      });
      throwLoadError(
        `Failed to load product reference grants for role ${roleId}`,
        e,
      );
    } finally {
      if (!silent) {
        runInAction(() => {
          if (this.productReferenceGrantsLoadingRoleId === roleId) {
            this.productReferenceGrantsLoadingRoleId = null;
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

  updateRoleWithGrants = async (
    roleId: number,
    rolePayload: WorkspaceRoleUpdatePayload,
    related?: {
      integrationGrants?: WorkspaceRoleIntegrationGrantsUpdatePayload;
      productReferenceGrants?: WorkspaceRoleProductReferenceGrantsUpdatePayload;
    },
  ): Promise<void> => {
    const integrationGrantsPayload = related?.integrationGrants;
    const productReferenceGrantsPayload = related?.productReferenceGrants;

    runInAction(() => {
      this.saveLoading = true;
      if (integrationGrantsPayload) {
        this.integrationGrantsSaveLoadingRoleId = roleId;
      }
      if (productReferenceGrantsPayload) {
        this.productReferenceGrantsSaveLoadingRoleId = roleId;
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

      if (productReferenceGrantsPayload) {
        await workspaceRolesApi.updateProductReferenceGrants(
          roleId,
          productReferenceGrantsPayload,
        );
      }

      await Promise.all([
        this.loadRoles({ silent: true }),
        integrationGrantsPayload
          ? this.loadIntegrationGrants(roleId, { silent: true })
          : Promise.resolve(),
        productReferenceGrantsPayload
          ? this.loadProductReferenceGrants(roleId, { silent: true })
          : Promise.resolve(),
      ]);
    } finally {
      runInAction(() => {
        this.saveLoading = false;
        if (this.integrationGrantsSaveLoadingRoleId === roleId) {
          this.integrationGrantsSaveLoadingRoleId = null;
        }
        if (this.productReferenceGrantsSaveLoadingRoleId === roleId) {
          this.productReferenceGrantsSaveLoadingRoleId = null;
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
