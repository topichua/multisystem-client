import { Alert, Button, Popconfirm } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

import * as MobileS from "../mobile-settings-page.styled";
import { AutomationRuleForm } from "./automation-rule-form";
import { useAutomationEditor } from "./use-automation-editor";

export const MobileSettingsAutomationEditorPage = observer(() => {
  const { t } = useTranslation();
  const editor = useAutomationEditor();

  if (editor.isInvalidId) {
    return (
      <MobileS.Root {...dataQaAttrs("settings-mobile-automation-editor")}>
        <Alert type="error" title={t("automation.invalidId")} showIcon />
      </MobileS.Root>
    );
  }

  if (editor.isLoading) {
    return (
      <MobileS.Root {...dataQaAttrs("settings-mobile-automation-editor")}>
        <CenteredSpinner />
      </MobileS.Root>
    );
  }

  if (editor.isNotFound) {
    return (
      <MobileS.Root {...dataQaAttrs("settings-mobile-automation-editor")}>
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
      </MobileS.Root>
    );
  }

  return (
    <MobileS.Root {...dataQaAttrs("settings-mobile-automation-editor")}>
      <MobileS.ScrollRegion>
        <MobileS.ContentSection>
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
            <MobileS.FooterActions>
              <Popconfirm
                title={t("automation.deleteConfirmTitle")}
                okText={t("automation.delete")}
                okButtonProps={{ danger: true }}
                onConfirm={() => void editor.handleDelete()}
              >
                <Button
                  danger
                  block
                  loading={editor.deleteLoading}
                  data-qa="settings-mobile-automation-delete"
                >
                  {t("automation.delete")}
                </Button>
              </Popconfirm>
            </MobileS.FooterActions>
          ) : null}
        </MobileS.ContentSection>
      </MobileS.ScrollRegion>
    </MobileS.Root>
  );
});
