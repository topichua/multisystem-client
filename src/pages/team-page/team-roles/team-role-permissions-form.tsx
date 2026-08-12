import { Flex } from "antd";
import { useMemo } from "react";

import type {
  WorkspacePermissionsCatalogSchema,
  WorkspaceRoleIntegrationGrant,
  WorkspaceRoleProductReferenceGrant,
} from "@/features/workspace-roles/model/workspace-role.types";

import { collectRowsFromModule } from "./team-role-permissions-form.utils";
import { TeamRolePermissionsModuleCard } from "./team-role-permissions-module-card";

type TeamRolePermissionsFormProps = {
  schema: WorkspacePermissionsCatalogSchema;
  integrationGrants: WorkspaceRoleIntegrationGrant[];
  integrationGrantsError?: string | null;
  integrationGrantsLoading?: boolean;
  productReferenceGrants: WorkspaceRoleProductReferenceGrant[];
  productReferenceGrantsError?: string | null;
  productReferenceGrantsLoading?: boolean;
  layoutVariant?: "default" | "mobile";
};

export const TeamRolePermissionsForm = ({
  integrationGrants,
  integrationGrantsError,
  integrationGrantsLoading,
  productReferenceGrants,
  productReferenceGrantsError,
  productReferenceGrantsLoading,
  schema,
  layoutVariant = "default",
}: TeamRolePermissionsFormProps) => {
  const moduleRows = useMemo(
    () =>
      schema.modules.map((module) => ({
        module,
        rows: collectRowsFromModule(module),
      })),
    [schema],
  );

  return (
    <Flex vertical gap={24}>
      {moduleRows.map(({ module, rows }) => (
        <TeamRolePermissionsModuleCard
          key={module.module}
          layoutVariant={layoutVariant}
          integrationGrants={integrationGrants}
          integrationGrantsError={integrationGrantsError}
          integrationGrantsLoading={integrationGrantsLoading}
          productReferenceGrants={productReferenceGrants}
          productReferenceGrantsError={productReferenceGrantsError}
          productReferenceGrantsLoading={productReferenceGrantsLoading}
          module={module}
          rows={rows}
        />
      ))}
    </Flex>
  );
};
