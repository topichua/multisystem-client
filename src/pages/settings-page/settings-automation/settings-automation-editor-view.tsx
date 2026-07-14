import { Alert, Button, Popconfirm } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { AutomationRuleForm } from "./automation-rule-form";
import { useAutomationEditor } from "./use-automation-editor";

export const SettingsAutomationEditorView = observer(() => {
  const { t } = useTranslation();
  const editor = useAutomationEditor();

  if (editor.isInvalidId) {
    return (
      <Alert type="error" title={t("automation.invalidId")} showIcon />
    );
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

  return (
    <PaneDetailLayout.Root inset data-qa="layout-settings-automation-editor">
      <PaneDetailLayout.Body data-qa="layout-settings-automation-editor-body">
        <AutomationRuleForm
          form={editor.form}
          mode={editor.isCreate ? "create" : "edit"}
          title={editor.title}
          criteria={editor.criteria}
          saveLoading={editor.saveLoading}
          onBack={editor.navigateToList}
          onSubmit={(values) => void editor.handleSubmit(values)}
        />

        {!editor.isCreate ? (
          <div style={{ maxWidth: 960, margin: "16px auto 0" }}>
            <Popconfirm
              title={t("automation.deleteConfirmTitle")}
              okText={t("automation.delete")}
              okButtonProps={{ danger: true }}
              onConfirm={() => void editor.handleDelete()}
            >
              <Button
                danger
                loading={editor.deleteLoading}
                data-qa="settings-automation-delete"
              >
                {t("automation.delete")}
              </Button>
            </Popconfirm>
          </div>
        ) : null}
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
