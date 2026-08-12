import { apiClient } from "@/api/api-client";

import type {
  WorkspacePermissionsCatalogResponse,
  WorkspaceRole,
  WorkspaceRoleCreatePayload,
  WorkspaceRoleIntegrationGrant,
  WorkspaceRoleIntegrationGrantsResponse,
  WorkspaceRoleIntegrationGrantsUpdatePayload,
  WorkspaceRoleProductReferenceGrant,
  WorkspaceRoleProductReferenceGrantsResponse,
  WorkspaceRoleProductReferenceGrantsUpdatePayload,
  WorkspaceRolesListResponse,
  WorkspaceRoleUpdatePayload,
} from "../model/workspace-role.types";

const basePath = "/workspace/roles";
const catalogPath = "/permissions/catalog";

export const workspaceRolesApi = {
  getPermissionsCatalog:
    async (): Promise<WorkspacePermissionsCatalogResponse> => {
      const { data } =
        await apiClient.get<WorkspacePermissionsCatalogResponse>(catalogPath);

      return data;
    },

  list: async (): Promise<WorkspaceRole[]> => {
    const { data } = await apiClient.get<WorkspaceRolesListResponse>(basePath, {
      params: {
        include_members_count: true,
      },
    });

    return data.items;
  },

  getIntegrationGrants: async (
    roleId: number,
  ): Promise<WorkspaceRoleIntegrationGrant[]> => {
    const { data } =
      await apiClient.get<WorkspaceRoleIntegrationGrantsResponse>(
        `${basePath}/${roleId}/integration-grants`,
      );

    return data.grants;
  },

  getProductReferenceGrants: async (
    roleId: number,
  ): Promise<WorkspaceRoleProductReferenceGrant[]> => {
    const { data } =
      await apiClient.get<WorkspaceRoleProductReferenceGrantsResponse>(
        `${basePath}/${roleId}/product-reference-grants`,
      );

    return data.grants;
  },

  create: async (payload: WorkspaceRoleCreatePayload): Promise<void> => {
    await apiClient.post(basePath, payload);
  },

  update: async (
    roleId: number,
    payload: WorkspaceRoleUpdatePayload,
  ): Promise<void> => {
    await apiClient.patch(`${basePath}/${roleId}`, payload);
  },

  updateIntegrationGrants: async (
    roleId: number,
    payload: WorkspaceRoleIntegrationGrantsUpdatePayload,
  ): Promise<void> => {
    await apiClient.put(`${basePath}/${roleId}/integration-grants`, payload);
  },

  updateProductReferenceGrants: async (
    roleId: number,
    payload: WorkspaceRoleProductReferenceGrantsUpdatePayload,
  ): Promise<void> => {
    await apiClient.put(
      `${basePath}/${roleId}/product-reference-grants`,
      payload,
    );
  },

  delete: async (roleId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${roleId}`);
  },
};
