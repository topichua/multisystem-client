import { Alert, Button, Form, Input } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { FormCard } from "@/components/layout/form-card";

import { getTemplateCharacterCount } from "./settings-templates.utils";
import { TemplateBodyField } from "./template-body-field";
import { TemplateDetailHeader } from "./template-detail-header";
import { useSettingsTemplateEditor } from "./use-settings-template-editor";

export const SettingsTemplateDetailView = observer(() => {
  const { t } = useTranslation();
  const { templateId } = useParams<{ templateId: string }>();
  const {
    template,
    form,
    templateBody,
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
              <Form.Item
                name="name"
                label={t("templates.name")}
                rules={[{ required: true, message: t("templates.required") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="template"
                label={t("templates.body")}
                rules={[{ required: true, message: t("templates.required") }]}
                extra={t("templates.bodyHint", {
                  count: getTemplateCharacterCount(templateBody),
                })}
              >
                <TemplateBodyField rows={8} data-qa="template-edit-body" />
              </Form.Item>
            </Form>
          </FormCard>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
