import { Button, Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useOutletContext } from "react-router";

import { getSettingsTemplatePath } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";

import type { SettingsTemplatesOutletContext } from "./settings-templates-layout";

export const SettingsTemplatesIndex = observer(() => {
  const { t } = useTranslation();
  const { onCreateClick } = useOutletContext<SettingsTemplatesOutletContext>();
  const store = useMessageTemplatesStore();

  const sortedTemplates = useMemo(
    () =>
      [...store.templates].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [store.templates],
  );

  if (store.listLoading && store.templates.length === 0) {
    return <CenteredSpinner />;
  }

  if (sortedTemplates.length > 0) {
    return (
      <Navigate to={getSettingsTemplatePath(sortedTemplates[0].id)} replace />
    );
  }

  return (
    <Empty
      description={t("templates.noTemplatesYet")}
      style={{ marginTop: 48 }}
    >
      <Button type="primary" onClick={onCreateClick}>
        {t("templates.createTemplate")}
      </Button>
    </Empty>
  );
});
