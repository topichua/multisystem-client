import { Button, Card, Flex, Form, theme } from "antd";
import { Tag } from "@/components/tag/tag";
import {
  ChartLineUpIcon,
  ChatsCircleIcon,
  GearSixIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";

import type {
  WorkspacePermissionsCatalogModule,
  WorkspaceRoleIntegrationGrant,
} from "@/features/workspace-roles/model/workspace-role.types";

import { TeamRolePermissionFormRow } from "./team-role-permission-form-row";
import { getCatalogModuleLabel } from "./team-role-permissions-i18n";
import {
  getPermissionsValues,
  isPermissionDisabled,
  setPermissionValues,
  type PermissionFormRow,
} from "./team-role-permissions-form.utils";

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

  return (
    <Card
      size="small"
      styles={{
        body: { padding: 0 },
        header: {
          minHeight: 50,
          padding: "12px 24px",
          background: "#f1eeff",
          fontWeight: 700,
        },
      }}
      title={
        <Flex align="center" gap={10} wrap="wrap">
          <Icon size={20} />
          <span>{getCatalogModuleLabel(t, module)}</span>
          <Tag color="green">
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
      {rows.map((row, index) => (
        <TeamRolePermissionFormRow
          key={row.item.key}
          row={row}
          index={index}
          borderColor={token.colorBorderSecondary}
          borderRadius={token.borderRadiusLG}
          permissionValues={permissionValues}
          integrationGrants={integrationGrants}
          integrationGrantsLoading={integrationGrantsLoading ?? false}
          integrationGrantsError={integrationGrantsError}
          setBooleanPermission={setBooleanPermission}
        />
      ))}
    </Card>
  );
};
