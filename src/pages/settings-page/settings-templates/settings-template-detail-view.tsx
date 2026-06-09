import { Alert, Button, Flex, Form, Input, message, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsTemplatePath, pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";

import { getTemplateCharacterCount } from "./settings-templates.utils";
import { TemplateDetailHeader } from "./template-detail-header";
import type { TemplateFormValues } from "./template-form-modal";

export const SettingsTemplateDetailView = observer(() => {
  const { t } = useTranslation();
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const store = useMessageTemplatesStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<TemplateFormValues>();
  const templateBody = Form.useWatch("template", form) ?? "";

  const idNum = templateId != null ? Number(templateId) : NaN;

  const template = useMemo(
    () =>
      Number.isFinite(idNum)
        ? store.templates.find((item) => item.id === idNum)
        : undefined,
    [idNum, store.templates],
  );

  useEffect(() => {
    if (template) {
      form.setFieldsValue({
        name: template.name,
        template: template.template,
      });
    }
  }, [form, template]);

  const pickNavigateAfterDelete = useCallback(() => {
    const sorted = [...store.templates].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    const idx = sorted.findIndex((item) => item.id === idNum);
    const next = sorted[idx + 1] ?? sorted[idx - 1];
    if (next) {
      navigate(getSettingsTemplatePath(next.id));
    } else {
      navigate(pagesMap.settingsTemplates);
    }
  }, [idNum, navigate, store.templates]);

  const handleSave = useCallback(async () => {
    if (!template) {
      return;
    }

    let values: TemplateFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    try {
      await store.updateTemplate(template.id, {
        name: values.name.trim(),
        template: values.template ?? "",
      });
      messageApi.success(t("templates.updated"));
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("templates.updateError")));
    }
  }, [form, messageApi, store, t, template]);

  const handleDelete = useCallback(async () => {
    if (!template) {
      return;
    }

    try {
      await store.deleteTemplate(template.id);
      messageApi.success(t("templates.deleted"));
      pickNavigateAfterDelete();
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("templates.deleteError")));
    }
  }, [messageApi, pickNavigateAfterDelete, store, t, template]);

  if (!Number.isFinite(idNum)) {
    return (
      <Alert type="error" message={t("templates.invalidTemplate")} showIcon />
    );
  }

  if (store.listLoading && !template) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  if (!store.listLoading && !template) {
    return (
      <Alert
        type="warning"
        title={t("templates.notFoundTitle")}
        description={t("templates.notFound")}
        showIcon
        action={
          <Button
            size="small"
            onClick={() => navigate(pagesMap.settingsTemplates)}
          >
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
      {contextHolder}
      <PaneDetailLayout.Root data-qa="layout-settings-template-detail">
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
          <Flex
            vertical
            style={{ maxWidth: 780, margin: "20px auto", width: "100%" }}
          >
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
                <Input.TextArea rows={8} />
              </Form.Item>
            </Form>
          </Flex>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
