import { Form, message } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsTemplatePath, pagesMap } from "@/app/router/pages-map";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";

import { SettingsTemplatesSidebar } from "./settings-templates-sidebar";
import {
  TemplateFormModal,
  type TemplateFormValues,
} from "./template-form-modal";

export const SettingsTemplatesLayout = observer(() => {
  const { t } = useTranslation();
  const store = useMessageTemplatesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<TemplateFormValues>();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void store.loadTemplates();
  }, [store]);

  const sortedTemplates = useMemo(
    () =>
      [...store.templates].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [store.templates],
  );

  const activeTemplateId = useMemo(() => {
    const match = matchPath(
      {
        path: `${pagesMap.settingsTemplates}/:templateId`,
        end: true,
      },
      location.pathname,
    );
    const parsedId = match?.params.templateId
      ? Number(match.params.templateId)
      : NaN;

    return Number.isFinite(parsedId) ? parsedId : null;
  }, [location.pathname]);

  const openCreate = useCallback(() => {
    form.setFieldsValue({ name: "", template: "" });
    setModalOpen(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleModalOk = useCallback(async () => {
    let values: TemplateFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return Promise.reject();
    }

    try {
      const created = await store.createTemplate({
        name: values.name.trim(),
        template: values.template ?? "",
      });
      messageApi.success(t("templates.created"));
      closeModal();
      if (created) {
        navigate(getSettingsTemplatePath(created.id));
      }
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("templates.createError")));
      return Promise.reject();
    }
  }, [closeModal, form, messageApi, navigate, store, t]);

  return (
    <>
      {contextHolder}
      <PaneNavSplitLayout.Root data-qa="layout-settings-templates-shell">
        <SettingsTemplatesSidebar
          templates={sortedTemplates}
          activeTemplateId={activeTemplateId}
          listLoading={store.listLoading}
          listError={store.listError}
          onCreateClick={openCreate}
          onTemplateClick={(templateId) =>
            navigate(getSettingsTemplatePath(templateId))
          }
        />

        <PaneNavSplitLayout.SubMain data-qa="layout-settings-templates-main">
          <Outlet
            context={
              {
                onCreateClick: openCreate,
              } satisfies SettingsTemplatesOutletContext
            }
          />
        </PaneNavSplitLayout.SubMain>
      </PaneNavSplitLayout.Root>

      <TemplateFormModal
        open={modalOpen}
        form={form}
        saveLoading={store.saveLoading}
        onCancel={closeModal}
        onOk={handleModalOk}
      />
    </>
  );
});

export type SettingsTemplatesOutletContext = {
  onCreateClick: () => void;
};
