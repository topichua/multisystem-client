import {
  Alert,
  Button,
  Empty,
  Flex,
  Form,
  Input,
  Popconfirm,
  Typography,
} from "antd";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";
import { PresetColorPicker } from "@/shared/components/preset-color-picker/preset-color-picker";
import { RoleDot } from "@/shared/components/role-dot/role-dot";
import { useTranslation } from "react-i18next";

import { TeamRolePermissionsForm } from "./team-role-permissions-form";
import { useTeamRoleEditor } from "./use-team-role-editor";

const { Text, Title } = Typography;

export const TeamRoleDetailView = observer(() => {
  const { t } = useTranslation();
  const { roleId } = useParams<{ roleId: string }>();
  const {
    role,
    form,
    store,
    integrationGrants,
    integrationGrantsError,
    integrationGrantsLoading,
    isInvalidId,
    isLoading,
    isNotFound,
    showCatalogLoader,
    handleSave,
    handleDelete,
    navigateToRoles,
  } = useTeamRoleEditor(roleId);

  if (isInvalidId) {
    return <Alert type="error" title={t("team.invalidRole")} showIcon />;
  }

  if (isLoading) {
    return <CenteredSpinner />;
  }

  if (isNotFound) {
    return (
      <Alert
        type="warning"
        title={t("team.roleNotFoundTitle")}
        description={t("team.roleNotFoundDescription")}
        showIcon
        action={
          <Button size="small" onClick={navigateToRoles}>
            {t("team.backToRoles")}
          </Button>
        }
      />
    );
  }

  if (!role) {
    return null;
  }

  return (
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
            <Flex vertical gap={24} style={{ maxWidth: 960, margin: "0 auto" }}>
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
                  columns={5}
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
  );
});
