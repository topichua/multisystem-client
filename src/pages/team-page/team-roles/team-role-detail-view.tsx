import {
  Alert,
  Button,
  Empty,
  Flex,
  Form,
  Input,
  message,
  Popconfirm,
  Typography,
} from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getTeamRolePath, pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type { WorkspaceRoleIntegrationGrant } from "@/features/workspace-roles/model/workspace-role.types";
import { useWorkspaceRolesStore } from "@/features/workspace-roles/model/use-workspace-roles-store";
import {
  buildWorkspaceRoleIntegrationGrantsPayload,
  buildWorkspaceRoleUpdatePayload,
  hasIntegrationGrantCatalogItem,
  toWorkspaceRoleFormValues,
  type WorkspaceRoleFormValues,
} from "@/features/workspace-roles/utils/workspace-role-form";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";
import { PresetColorPicker } from "@/shared/components/preset-color-picker/preset-color-picker";
import { RoleDot } from "@/shared/components/role-dot/role-dot";

import { TeamRolePermissionsForm } from "./team-role-permissions-form";

const { Text, Title } = Typography;

const EMPTY_INTEGRATION_GRANTS: WorkspaceRoleIntegrationGrant[] = [];

export const TeamRoleDetailView = observer(() => {
  const { t } = useTranslation();
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const store = useWorkspaceRolesStore();
  const [messageApi, contextHolder] = message.useMessage();
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

  useEffect(() => {
    if (!role || !store.catalog) {
      return;
    }

    form.setFieldsValue(
      toWorkspaceRoleFormValues(role, store.catalog, integrationGrants),
    );
  }, [form, integrationGrants, role, store.catalog]);

  useEffect(() => {
    if (!role || !shouldLoadIntegrationGrants) {
      return;
    }

    void store.loadIntegrationGrants(role.id);
  }, [role, shouldLoadIntegrationGrants, store]);

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
      await store.updateRoleWithIntegrationGrants(
        role.id,
        buildWorkspaceRoleUpdatePayload(role, store.catalog, values),
        shouldLoadIntegrationGrants && integrationGrantsLoaded
          ? buildWorkspaceRoleIntegrationGrantsPayload(
              store.catalog,
              integrationGrants,
              values,
            )
          : undefined,
      );
      messageApi.success(t("team.roleUpdated"));
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("team.roleUpdateError")));
    }
  }, [
    form,
    integrationGrants,
    integrationGrantsLoaded,
    messageApi,
    role,
    shouldLoadIntegrationGrants,
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
  }, [role, store]);

  const handleDelete = useCallback(async () => {
    if (!role) {
      return;
    }

    const pathAfterDelete = pickNavigateAfterDelete();

    try {
      await store.deleteRole(role.id);
      messageApi.success(t("team.roleDeleted"));
      navigate(pathAfterDelete);
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("team.roleDeleteError")));
    }
  }, [messageApi, navigate, pickNavigateAfterDelete, role, store, t]);

  if (!Number.isFinite(idNum)) {
    return <Alert type="error" title={t("team.invalidRole")} showIcon />;
  }

  if (store.listLoading && !role) {
    return <CenteredSpinner />;
  }

  if (!store.listLoading && !role) {
    return (
      <Alert
        type="warning"
        title={t("team.roleNotFoundTitle")}
        description={t("team.roleNotFoundDescription")}
        showIcon
        action={
          <Button size="small" onClick={() => navigate(pagesMap.teamRoles)}>
            {t("team.backToRoles")}
          </Button>
        }
      />
    );
  }

  if (!role) {
    return null;
  }

  const showCatalogLoader = store.catalogLoading && !store.catalog;

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root inset data-qa="layout-team-role-detail">
        <PaneDetailLayout.Header data-qa="layout-team-role-detail-header">
          <Flex justify="space-between" align="center" gap={16} wrap="wrap">
            <Flex align="center" gap={8}>
              <RoleDot color={role.color ?? DEFAULT_COLOR_PRESET} size={15} />
              <Title level={4} style={{ margin: 0 }}>
                {role.name}
              </Title>
            </Flex>
            <Flex gap={8} align="center" wrap="wrap" style={{ flexShrink: 0 }}>
              <Button
                type="primary"
                loading={
                  store.saveLoading ||
                  store.integrationGrantsSaveLoadingRoleId === role.id
                }
                disabled={!store.catalog || integrationGrantsLoading}
                onClick={() => void handleSave()}
              >
                {t("team.saveRole")}
              </Button>
              <Popconfirm
                title={t("team.roleDeleteConfirmTitle")}
                okText={t("team.deleteRole")}
                okButtonProps={{ danger: true }}
                onConfirm={() => void handleDelete()}
              >
                <Button danger loading={store.deleteLoadingId === role.id}>
                  {t("team.deleteRole")}
                </Button>
              </Popconfirm>
            </Flex>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-team-role-detail-body">
          {showCatalogLoader ? (
            <CenteredSpinner />
          ) : store.catalogError && !store.catalog ? (
            <Alert
              type="error"
              title={t("team.rolesCatalogError")}
              description={store.catalogError}
              showIcon
            />
          ) : store.catalog ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={() => void handleSave()}
            >
              <Flex
                vertical
                gap={24}
                style={{ maxWidth: 960, margin: "0 auto" }}
              >
                <Form.Item
                  name="name"
                  label={t("team.roleName")}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: t("team.roleNameRequired"),
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label={t("team.roleDescription")}
                  style={{ marginBottom: 0 }}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="color"
                  label={t("team.roleColor")}
                  style={{ marginBottom: 0 }}
                >
                  <PresetColorPicker
                    ariaLabel={t("team.roleColorPickerAria")}
                  />
                </Form.Item>
                <Flex vertical gap={4}>
                  <Title level={4} style={{ margin: 0 }}>
                    {t("team.rolesPermissionsTitle")}
                  </Title>
                  <Text type="secondary">
                    {t("team.rolesPermissionsSubtitle")}
                  </Text>
                </Flex>
                <TeamRolePermissionsForm
                  integrationGrants={integrationGrants}
                  integrationGrantsError={integrationGrantsError}
                  integrationGrantsLoading={integrationGrantsLoading}
                  schema={store.catalog}
                />
              </Flex>
            </Form>
          ) : (
            <Empty description={t("team.rolesCatalogError")} />
          )}
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
