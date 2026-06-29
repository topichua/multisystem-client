import { Form } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsTemplatePath, pagesMap } from "@/app/router/pages-map";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { TemplateFormValues } from "./template-form-modal";

export function useSettingsTemplateEditor(templateId: string | undefined) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useMessageTemplatesStore();
  const notification = useNotification();
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
      notification.success({ title: t("templates.updated") });
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("templates.updateError")),
      });
    }
  }, [form, notification, store, t, template]);

  const handleDelete = useCallback(async () => {
    if (!template) {
      return;
    }

    try {
      await store.deleteTemplate(template.id);
      notification.success({ title: t("templates.deleted") });
      pickNavigateAfterDelete();
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("templates.deleteError")),
      });
    }
  }, [notification, pickNavigateAfterDelete, store, t, template]);

  return {
    idNum,
    template,
    form,
    templateBody,
    store,
    isInvalidId: !Number.isFinite(idNum),
    isLoading: store.listLoading && !template,
    isNotFound: !store.listLoading && !template,
    handleSave,
    handleDelete,
    navigateToTemplates: () => navigate(pagesMap.settingsTemplates),
  };
}
