import { Alert, Button, Form } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { FormCard } from "@/components/layout/form-card";

import { TemplateDetailHeader } from "./template-detail-header";
import { TemplateFormFields } from "./template-form-fields";
import { useSettingsTemplateEditor } from "./use-settings-template-editor";

export const SettingsTemplateDetailView = observer(() => {
  const { t } = useTranslation();
  const { templateId } = useParams<{ templateId: string }>();
  const {
    template,
    form,
    store,
    isInvalidId,
    isLoading,
    isNotFound,
    handleSave,
    handleDelete,
    navigateToTemplates,
  } = useSettingsTemplateEditor(templateId);

  if (isInvalidId) {
    return (
      <Alert type="error" title={t("templates.invalidTemplate")} showIcon />
    );
  }

  if (isLoading) {
    return <CenteredSpinner />;
  }

  if (isNotFound) {
    return (
      <Alert
        type="warning"
        title={t("templates.notFoundTitle")}
        description={t("templates.notFound")}
        showIcon
        action={
          <Button size="small" onClick={navigateToTemplates}>
            {t("templates.backToTemplates")}
          </Button>
        }
      />
    );
  }

  if (!template) {
    return null;
  }

  return (
    <>
      <PaneDetailLayout.Root inset data-qa="layout-settings-template-detail">
        <PaneDetailLayout.Header data-qa="layout-settings-template-detail-header">
          <TemplateDetailHeader
            name={template.name}
            saveLoading={store.saveLoading}
            deleteLoading={store.deleteLoadingId === template.id}
            onSave={() => void handleSave()}
            onDelete={() => void handleDelete()}
          />
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-settings-template-detail-body">
          <FormCard>
            <Form
              form={form}
              layout="vertical"
              requiredMark
              onFinish={handleSave}
            >
              <TemplateFormFields
                bodyRows={8}
                bodyDataQa="template-edit-body"
              />
            </Form>
          </FormCard>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
