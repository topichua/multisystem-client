import {
  Button,
  Card,
  Flex,
  Form,
  Segmented,
  Spin,
  Switch,
  Tag,
  theme,
  Typography,
} from "antd";
import {
  ChartLineUpIcon,
  ChatsCircleIcon,
  GearSixIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import type { ComponentType, ReactNode } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import type {
  WorkspacePermissionsCatalogItem,
  WorkspacePermissionsCatalogModule,
  WorkspaceRoleIntegrationGrant,
} from "@/features/workspace-roles/model/workspace-role.types";
import { getIntegrationGrantFormKey } from "@/features/workspace-roles/utils/workspace-role-form";

import {
  getCatalogItemLabel,
  getCatalogModuleLabel,
  getIntegrationGrantFallbackName,
  getIntegrationTypeLabel,
} from "./team-role-permissions-i18n";
import {
  getPermissionsValues,
  isGrantItemVisibleForIntegration,
  isPermissionDisabled,
  setPermissionValues,
  toSelectOptions,
  type PermissionFormRow,
} from "./team-role-permissions-form.utils";

const { Text } = Typography;

type ModuleCardProps = {
  integrationGrants: WorkspaceRoleIntegrationGrant[];
  integrationGrantsError?: string | null;
  integrationGrantsLoading?: boolean;
  module: WorkspacePermissionsCatalogModule;
  rows: PermissionFormRow[];
};

const MODULE_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  analytics: ChartLineUpIcon,
  clients: UsersIcon,
  conversations: ChatsCircleIcon,
  orders: ReceiptIcon,
  products: PackageIcon,
  workspace: GearSixIcon,
};

const renderRowLabel = (
  t: TFunction,
  item: WorkspacePermissionsCatalogItem,
  nested: boolean,
  disabled: boolean,
): ReactNode => (
  <Flex align="center" gap={10} style={{ minWidth: 0 }}>
    {nested && (
      <Text type="secondary" aria-hidden>
        -
      </Text>
    )}
    <Text type={disabled ? "secondary" : undefined}>
      {getCatalogItemLabel(t, item)}
    </Text>
  </Flex>
);

export const TeamRolePermissionsModuleCard = ({
  integrationGrants,
  integrationGrantsError,
  integrationGrantsLoading,
  module,
  rows,
}: ModuleCardProps) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const { token } = theme.useToken();
  const watchedPermissions = Form.useWatch("permissions", form);

  const permissionValues = watchedPermissions ?? getPermissionsValues(form);
  const booleanRows = rows.filter((row) => row.kind === "boolean");
  const selectedCount = booleanRows.filter(
    (row) =>
      permissionValues[row.item.key] === true &&
      !isPermissionDisabled(permissionValues, row.disabledBy),
  ).length;
  const allSelected =
    booleanRows.length > 0 && selectedCount === booleanRows.length;
  const Icon = MODULE_ICONS[module.module] ?? GearSixIcon;

  const setModulePermissions = (checked: boolean): void => {
    setPermissionValues(
      form,
      Object.fromEntries(
        booleanRows.map((row) => [row.item.key, checked] as const),
      ),
    );
  };

  const setBooleanPermission = (
    row: Extract<PermissionFormRow, { kind: "boolean" }>,
    checked: boolean,
  ): void => {
    const dependents = checked
      ? []
      : booleanRows.filter(
          (candidate) => candidate.disabledBy === row.item.key,
        );

    setPermissionValues(form, {
      [row.item.key]: checked,
      ...Object.fromEntries(
        dependents.map((candidate) => [candidate.item.key, false] as const),
      ),
    });
  };

  const renderRow = (row: PermissionFormRow, index: number): ReactNode => {
    const borderTop =
      index === 0 ? undefined : `1px solid ${token.colorBorderSecondary}`;
    const rowStyle = {
      borderTop,
      padding: "16px 24px",
    };

    if (row.kind === "integration_grants") {
      const fullAccessEnabled =
        permissionValues["conversations.full_access"] === true;

      return (
        <div key={row.item.key} style={rowStyle}>
          <Flex vertical gap={16}>
            {integrationGrantsError ? (
              <Text type="danger">
                {t("team.rolesIntegrationGrantsError")}:{" "}
                {integrationGrantsError}
              </Text>
            ) : null}
            {integrationGrantsLoading ? (
              <Spin />
            ) : integrationGrants.length === 0 ? (
              <Text type="secondary">
                {t("team.rolesIntegrationGrantsEmpty")}
              </Text>
            ) : (
              integrationGrants.map((grant) => {
                const visibleItems =
                  row.item.items?.filter((item) =>
                    isGrantItemVisibleForIntegration(
                      item,
                      grant.integrationType,
                    ),
                  ) ?? [];
                const grantKey = getIntegrationGrantFormKey(grant);

                return (
                  <Flex
                    key={grantKey}
                    vertical
                    gap={12}
                    style={{
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: token.borderRadiusLG,
                      padding: 16,
                    }}
                  >
                    <Flex align="center" gap={8} wrap="wrap">
                      <Text strong>
                        {grant.integrationName ||
                          getIntegrationGrantFallbackName(
                            t,
                            grant.integrationType,
                            grant.integrationId,
                          )}
                      </Text>
                      <Tag>
                        {getIntegrationTypeLabel(t, grant.integrationType)}
                      </Tag>
                    </Flex>
                    {visibleItems.map((item) => (
                      <Flex
                        key={item.key}
                        align="center"
                        justify="space-between"
                        gap={16}
                        wrap="wrap"
                      >
                        <Text
                          type={fullAccessEnabled ? "secondary" : undefined}
                        >
                          {getCatalogItemLabel(t, item)}
                        </Text>
                        <Form.Item
                          name={[
                            "integrationGrants",
                            grantKey,
                            "permissions",
                            item.key,
                          ]}
                          valuePropName={
                            item.type === "boolean" ? "checked" : undefined
                          }
                          noStyle
                        >
                          {item.type === "option" ? (
                            <Segmented
                              disabled={fullAccessEnabled}
                              options={toSelectOptions(
                                t,
                                item.key,
                                item.options,
                              )}
                            />
                          ) : (
                            <Switch disabled={fullAccessEnabled} />
                          )}
                        </Form.Item>
                      </Flex>
                    ))}
                  </Flex>
                );
              })
            )}
          </Flex>
        </div>
      );
    }

    const disabled = isPermissionDisabled(permissionValues, row.disabledBy);

    if (row.kind === "option") {
      return (
        <Flex
          key={row.item.key}
          align="center"
          justify="space-between"
          gap={16}
          wrap="wrap"
          style={rowStyle}
        >
          {renderRowLabel(t, row.item, row.nested, disabled)}
          <Form.Item name={["permissionOptions", row.item.key]} noStyle>
            <Segmented
              disabled={disabled}
              options={toSelectOptions(t, row.item.key, row.item.options)}
            />
          </Form.Item>
        </Flex>
      );
    }

    return (
      <Flex
        key={row.item.key}
        align="center"
        justify="space-between"
        gap={16}
        style={rowStyle}
      >
        {renderRowLabel(t, row.item, row.nested, disabled)}
        <Form.Item
          name={["permissions", row.item.key]}
          valuePropName="checked"
          noStyle
        >
          <Switch
            disabled={disabled}
            onChange={(checked) => setBooleanPermission(row, checked)}
          />
        </Form.Item>
      </Flex>
    );
  };

  return (
    <Card
      size="small"
      styles={{ body: { padding: 0 } }}
      title={
        <Flex align="center" gap={10} wrap="wrap">
          <Icon size={20} />
          <span>{getCatalogModuleLabel(t, module)}</span>
          <Tag>
            {selectedCount}/{booleanRows.length}
          </Tag>
        </Flex>
      }
      extra={
        booleanRows.length > 0 ? (
          <Button
            type="link"
            onClick={() => setModulePermissions(!allSelected)}
          >
            {allSelected ? t("team.disableAll") : t("team.enableAll")}
          </Button>
        ) : null
      }
    >
      {rows.map(renderRow)}
    </Card>
  );
};
