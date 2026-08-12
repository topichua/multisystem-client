import { Flex, Form, Segmented, Spin, Switch, Typography } from "antd";
import { Tag } from "@/components/tag/tag";
import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import type { WorkspacePermissionsCatalogItem } from "@/features/workspace-roles/model/workspace-role.types";
import type { WorkspaceRoleIntegrationGrant } from "@/features/workspace-roles/model/workspace-role.types";
import type { WorkspaceRoleProductReferenceGrant } from "@/features/workspace-roles/model/workspace-role.types";
import { getIntegrationGrantFormKey } from "@/features/workspace-roles/utils/workspace-role-form";

import {
  getCatalogItemLabel,
  getIntegrationGrantFallbackName,
  getIntegrationTypeLabel,
} from "./team-role-permissions-i18n";
import {
  isGrantItemVisibleForIntegration,
  isPermissionDisabled,
  toSelectOptions,
  type PermissionFormRow,
} from "./team-role-permissions-form.utils";
import { TeamRoleProductReferenceGrantsSection } from "./team-role-product-reference-grants-section";

const { Text } = Typography;

type TeamRolePermissionFormRowProps = {
  row: PermissionFormRow;
  index: number;
  layoutVariant?: "default" | "mobile";
  borderColor: string;
  borderRadius: number;
  permissionValues: Record<string, boolean>;
  integrationGrants: WorkspaceRoleIntegrationGrant[];
  integrationGrantsLoading: boolean;
  integrationGrantsError?: string | null;
  productReferenceGrants: WorkspaceRoleProductReferenceGrant[];
  productReferenceGrantsLoading: boolean;
  productReferenceGrantsError?: string | null;
  setBooleanPermission: (
    row: Extract<PermissionFormRow, { kind: "boolean" }>,
    checked: boolean,
  ) => void;
};

const renderRowLabel = (
  t: TFunction,
  item: WorkspacePermissionsCatalogItem,
  nested: boolean,
  disabled: boolean,
): ReactNode => (
  <Flex align="center" gap={10} style={{ minWidth: 0, flex: "1 1 auto" }}>
    {nested && (
      <Text type="secondary" aria-hidden>
        -
      </Text>
    )}
    <Text type={disabled ? "secondary" : undefined} style={{ minWidth: 0 }}>
      {getCatalogItemLabel(t, item)}
    </Text>
  </Flex>
);

export const TeamRolePermissionFormRow = ({
  row,
  index,
  layoutVariant = "default",
  borderColor,
  borderRadius,
  permissionValues,
  integrationGrants,
  integrationGrantsLoading,
  integrationGrantsError,
  productReferenceGrants,
  productReferenceGrantsLoading,
  productReferenceGrantsError,
  setBooleanPermission,
}: TeamRolePermissionFormRowProps) => {
  const { t } = useTranslation();

  const rowPadding = layoutVariant === "mobile" ? "12px 16px" : "16px 24px";
  const borderTop = index === 0 ? undefined : `1px solid ${borderColor}`;
  const rowStyle = {
    borderTop,
    padding: rowPadding,
  };

  if (row.kind === "product_reference_grants") {
    return (
      <TeamRoleProductReferenceGrantsSection
        item={row.item}
        grants={productReferenceGrants}
        loading={productReferenceGrantsLoading}
        error={productReferenceGrantsError}
        borderColor={borderColor}
        borderRadius={borderRadius}
        rowPadding={rowPadding}
        borderTop={borderTop}
        permissionValues={permissionValues}
      />
    );
  }

  if (row.kind === "integration_grants") {
    const fullAccessEnabled =
      permissionValues["conversations.full_access"] === true;

    return (
      <div key={row.item.key} style={rowStyle}>
        <Flex vertical gap={16}>
          {integrationGrantsError && (
            <Text type="danger">
              {t("team.rolesIntegrationGrantsError")}: {integrationGrantsError}
            </Text>
          )}
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
                  isGrantItemVisibleForIntegration(item, grant.integrationType),
                ) ?? [];
              const grantKey = getIntegrationGrantFormKey(grant);

              return (
                <Flex
                  key={grantKey}
                  vertical
                  gap={12}
                  style={{
                    border: `1px solid ${borderColor}`,
                    borderRadius,
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
                      <Text type={fullAccessEnabled ? "secondary" : undefined}>
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
                            options={toSelectOptions(t, item.key, item.options)}
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
      wrap={layoutVariant === "mobile" ? "wrap" : undefined}
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
