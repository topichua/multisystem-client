import { TiktokLogoIcon } from "@phosphor-icons/react";
import { Flex, Form, Spin, Switch, Typography } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import type {
  WorkspacePermissionsCatalogItem,
  WorkspaceRoleProductReferenceGrant,
} from "@/features/workspace-roles/model/workspace-role.types";
import {
  getIntegrationGrantFormKey,
  type WorkspaceRoleFormValues,
  type WorkspaceRoleProductReferenceGrantFormValue,
} from "@/features/workspace-roles/utils/workspace-role-form";

import {
  getCatalogItemLabel,
  getIntegrationGrantFallbackName,
} from "./team-role-permissions-i18n";
import { areRequiredPermissionsEnabled } from "./team-role-permissions-form.utils";

const { Text } = Typography;

const ICON_SIZE = 22;

const getIntegrationIcon = (integrationType: string): ReactNode => {
  switch (integrationType) {
    case "instagram":
      return <InstagramLogoIcon size={ICON_SIZE} />;
    case "telegram":
      return <TelegramLogoIcon size={ICON_SIZE} />;
    case "tiktok":
      return <TiktokLogoIcon size={ICON_SIZE} weight="fill" />;
    default:
      return null;
  }
};

type TeamRoleProductReferenceGrantsSectionProps = {
  item: WorkspacePermissionsCatalogItem;
  grants: WorkspaceRoleProductReferenceGrant[];
  loading: boolean;
  error?: string | null;
  borderColor: string;
  borderRadius: number;
  rowPadding: string;
  borderTop?: string;
  permissionValues: Record<string, boolean>;
};

export const TeamRoleProductReferenceGrantsSection = ({
  item,
  grants,
  loading,
  error,
  borderColor,
  borderRadius,
  rowPadding,
  borderTop,
  permissionValues,
}: TeamRoleProductReferenceGrantsSectionProps) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance<WorkspaceRoleFormValues>();
  const watchedGrants = Form.useWatch("productReferenceGrants", form) as
    | Record<string, WorkspaceRoleProductReferenceGrantFormValue>
    | undefined;

  const requirementsMet = areRequiredPermissionsEnabled(
    permissionValues,
    item.requires,
  );
  const controlsDisabled = !requirementsMet || loading || grants.length === 0;

  const allEnabled =
    grants.length > 0 &&
    grants.every((grant) => {
      const key = getIntegrationGrantFormKey(grant);
      return watchedGrants?.[key]?.canManage === true;
    });

  const setAllCanManage = (checked: boolean): void => {
    if (!requirementsMet) {
      return;
    }

    form.setFieldsValue({
      productReferenceGrants: Object.fromEntries(
        grants.map((grant) => {
          const key = getIntegrationGrantFormKey(grant);

          return [
            key,
            {
              integrationType: grant.integrationType,
              integrationId: grant.integrationId,
              canManage: checked,
            } satisfies WorkspaceRoleProductReferenceGrantFormValue,
          ];
        }),
      ),
    });
  };

  return (
    <div style={{ borderTop, padding: rowPadding }}>
      <Flex
        vertical
        gap={12}
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius,
          padding: 16,
          opacity: requirementsMet ? 1 : 0.65,
        }}
      >
        <Flex align="center" justify="space-between" gap={16} wrap="wrap">
          <Text strong type={requirementsMet ? undefined : "secondary"}>
            {getCatalogItemLabel(t, item)}
          </Text>
          <Flex align="center" gap={8}>
            <Text type="secondary">
              {t("team.rolesProductReferenceGrantsAll")}
            </Text>
            <Switch
              checked={allEnabled}
              disabled={controlsDisabled}
              onChange={setAllCanManage}
            />
          </Flex>
        </Flex>

        {error && (
          <Text type="danger">
            {t("team.rolesProductReferenceGrantsError")}: {error}
          </Text>
        )}

        {loading ? (
          <Spin />
        ) : grants.length === 0 ? (
          <Text type="secondary">
            {t("team.rolesProductReferenceGrantsEmpty")}
          </Text>
        ) : (
          <Flex vertical gap={4}>
            {grants.map((grant) => {
              const grantKey = getIntegrationGrantFormKey(grant);
              const icon = getIntegrationIcon(grant.integrationType);

              return (
                <Flex
                  key={grantKey}
                  align="center"
                  justify="space-between"
                  gap={16}
                  wrap="wrap"
                  style={{ padding: "8px 0" }}
                >
                  <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                    {icon}
                    <Text
                      type={requirementsMet ? undefined : "secondary"}
                      style={{ minWidth: 0 }}
                    >
                      {grant.integrationName ||
                        getIntegrationGrantFallbackName(
                          t,
                          grant.integrationType,
                          grant.integrationId,
                        )}
                    </Text>
                  </Flex>
                  <Form.Item
                    name={["productReferenceGrants", grantKey, "canManage"]}
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch disabled={!requirementsMet} />
                  </Form.Item>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Flex>
    </div>
  );
};
