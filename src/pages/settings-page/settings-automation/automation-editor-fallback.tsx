import { Alert, Button } from "antd";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";

import type { AutomationEditor } from "./use-automation-editor";

type AutomationEditorFallbackProps = {
  editor: AutomationEditor;
};

export const AutomationEditorFallback = ({
  editor,
}: AutomationEditorFallbackProps) => {
  const { t } = useTranslation();

  if (editor.isInvalidId) {
    return <Alert type="error" title={t("automation.invalidId")} showIcon />;
  }

  if (editor.isLoading) {
    return <CenteredSpinner />;
  }

  if (editor.isNotFound) {
    return (
      <Alert
        type="warning"
        title={t("automation.notFoundTitle")}
        description={t("automation.notFound")}
        showIcon
        action={
          <Button size="small" onClick={editor.navigateToList}>
            {t("automation.backToList")}
          </Button>
        }
      />
    );
  }

  return null;
};
