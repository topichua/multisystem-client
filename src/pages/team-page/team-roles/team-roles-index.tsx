import { Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";

import { getTeamRolePath } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useWorkspaceRolesStore } from "@/features/workspace-roles/model/use-workspace-roles-store";

export const TeamRolesIndex = observer(() => {
  const { t } = useTranslation();
  const store = useWorkspaceRolesStore();
  const firstRole = store.sortedRoles[0];

  if (store.listLoading && store.roles.length === 0) {
    return <CenteredSpinner />;
  }

  if (firstRole) {
    return <Navigate to={getTeamRolePath(firstRole.id)} replace />;
  }

  return <Empty description={t("team.rolesEmpty")} style={{ marginTop: 48 }} />;
});
