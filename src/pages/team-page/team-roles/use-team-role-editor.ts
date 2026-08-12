import { Form } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getTeamRolePath, pagesMap } from "@/app/router/pages-map";
import type { WorkspaceRoleIntegrationGrant } from "@/features/workspace-roles/model/workspace-role.types";
import type { WorkspaceRoleProductReferenceGrant } from "@/features/workspace-roles/model/workspace-role.types";
import { useWorkspaceRolesStore } from "@/features/workspace-roles/model/use-workspace-roles-store";
import {
  buildWorkspaceRoleIntegrationGrantsPayload,
  buildWorkspaceRoleProductReferenceGrantsPayload,
  buildWorkspaceRoleUpdatePayload,
  hasIntegrationGrantCatalogItem,
  hasProductReferenceGrantCatalogItem,
  toWorkspaceRoleFormValues,
  type WorkspaceRoleFormValues,
} from "@/features/workspace-roles/utils/workspace-role-form";
import { useNotification } from "@/shared/components/notification/use-notification";

const EMPTY_INTEGRATION_GRANTS: WorkspaceRoleIntegrationGrant[] = [];
const EMPTY_PRODUCT_REFERENCE_GRANTS: WorkspaceRoleProductReferenceGrant[] = [];

export function useTeamRoleEditor(roleId: string | undefined) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useWorkspaceRolesStore();
  const notification = useNotification();
  const [form] = Form.useForm<WorkspaceRoleFormValues>();

  const idNum = roleId != null ? Number(roleId) : NaN;

  const role = useMemo(
    () =>
      Number.isFinite(idNum)
        ? store.roles.find((item) => item.id === idNum)
        : undefined,
    [idNum, store.roles],
  );

  const integrationGrants = role
    ? store.getIntegrationGrants(role.id)
    : EMPTY_INTEGRATION_GRANTS;
  const integrationGrantsLoaded = role
    ? store.hasLoadedIntegrationGrants(role.id)
    : false;
  const integrationGrantsLoading = role
    ? store.isIntegrationGrantsLoading(role.id)
    : false;
  const integrationGrantsError = role
    ? store.getIntegrationGrantsError(role.id)
    : null;
  const shouldLoadIntegrationGrants =
    store.catalog != null && hasIntegrationGrantCatalogItem(store.catalog);

  const productReferenceGrants = role
    ? store.getProductReferenceGrants(role.id)
    : EMPTY_PRODUCT_REFERENCE_GRANTS;
  const productReferenceGrantsLoaded = role
    ? store.hasLoadedProductReferenceGrants(role.id)
    : false;
  const productReferenceGrantsLoading = role
    ? store.isProductReferenceGrantsLoading(role.id)
    : false;
  const productReferenceGrantsError = role
    ? store.getProductReferenceGrantsError(role.id)
    : null;
  const shouldLoadProductReferenceGrants =
    store.catalog != null && hasProductReferenceGrantCatalogItem(store.catalog);

  useEffect(() => {
    if (!role || !store.catalog) {
      return;
    }

    form.setFieldsValue(
      toWorkspaceRoleFormValues(
        role,
        store.catalog,
        integrationGrants,
        productReferenceGrants,
      ),
    );
  }, [form, integrationGrants, productReferenceGrants, role, store.catalog]);

  useEffect(() => {
    if (!role || !shouldLoadIntegrationGrants) {
      return;
    }

    void store.loadIntegrationGrants(role.id);
  }, [role, shouldLoadIntegrationGrants, store]);

  useEffect(() => {
    if (!role || !shouldLoadProductReferenceGrants) {
      return;
    }

    void store.loadProductReferenceGrants(role.id);
  }, [role, shouldLoadProductReferenceGrants, store]);

  const handleSave = useCallback(async () => {
    if (!role || !store.catalog) {
      return;
    }

    let values: WorkspaceRoleFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    try {
      await store.updateRoleWithGrants(
        role.id,
        buildWorkspaceRoleUpdatePayload(role, store.catalog, values),
        {
          integrationGrants:
            shouldLoadIntegrationGrants && integrationGrantsLoaded
              ? buildWorkspaceRoleIntegrationGrantsPayload(
                  store.catalog,
                  integrationGrants,
                  values,
                )
              : undefined,
          productReferenceGrants:
            shouldLoadProductReferenceGrants && productReferenceGrantsLoaded
              ? buildWorkspaceRoleProductReferenceGrantsPayload(
                  productReferenceGrants,
                  values,
                )
              : undefined,
        },
      );
      notification.success({ title: t("team.roleUpdated") });
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("team.roleUpdateError")),
      });
    }
  }, [
    form,
    integrationGrants,
    integrationGrantsLoaded,
    notification,
    productReferenceGrants,
    productReferenceGrantsLoaded,
    role,
    shouldLoadIntegrationGrants,
    shouldLoadProductReferenceGrants,
    store,
    t,
  ]);

  const pickNavigateAfterDelete = useCallback(() => {
    if (!role) {
      return pagesMap.teamRoles;
    }

    const sorted = store.sortedRoles;
    const index = sorted.findIndex((item) => item.id === role.id);
    const nextRole = sorted[index + 1] ?? sorted[index - 1];

    return nextRole ? getTeamRolePath(nextRole.id) : pagesMap.teamRoles;
  }, [role, store.sortedRoles]);

  const handleDelete = useCallback(
    async (options?: { navigateToRolesList?: boolean }) => {
      if (!role) {
        return;
      }

      const pathAfterDelete = options?.navigateToRolesList
        ? pagesMap.teamRoles
        : pickNavigateAfterDelete();

      try {
        await store.deleteRole(role.id);
        notification.success({ title: t("team.roleDeleted") });
        navigate(pathAfterDelete);
      } catch (e) {
        notification.error({
          title: getApiErrorMessage(e, t("team.roleDeleteError")),
        });
      }
    },
    [navigate, notification, pickNavigateAfterDelete, role, store, t],
  );

  const relatedGrantsLoading =
    integrationGrantsLoading || productReferenceGrantsLoading;

  return {
    idNum,
    role,
    form,
    store,
    integrationGrants,
    integrationGrantsError,
    integrationGrantsLoading,
    productReferenceGrants,
    productReferenceGrantsError,
    productReferenceGrantsLoading,
    relatedGrantsLoading,
    shouldLoadIntegrationGrants,
    shouldLoadProductReferenceGrants,
    isInvalidId: !Number.isFinite(idNum),
    isLoading: store.listLoading && !role,
    isNotFound: !store.listLoading && !role,
    showCatalogLoader: store.catalogLoading && !store.catalog,
    handleSave,
    handleDelete,
    navigateToRoles: () => navigate(pagesMap.teamRoles),
  };
}
