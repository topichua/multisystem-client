import { Button, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Navigate, useOutletContext } from "react-router";

import { getSettingsGroupPath } from "@/app/router/pages-map";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";

import type { SettingsGroupsOutletContext } from "./settings-groups-layout";

export const SettingsGroupsIndex = observer(() => {
  const { t } = useTranslation();
  const { onCreateClick } = useOutletContext<SettingsGroupsOutletContext>();
  const store = useConversationGroupsStore();

  if (store.listLoading && store.groups.length === 0) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  const sorted = [...store.groups].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length > 0) {
    return <Navigate to={getSettingsGroupPath(sorted[0].id)} replace />;
  }

  return (
    <Empty description={t("groups.noGroupsYet")} style={{ marginTop: 48 }}>
      <Button type="primary" onClick={onCreateClick}>
        {t("groups.createGroup")}
      </Button>
    </Empty>
  );
});
