import { Form } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsTemplatePath, pagesMap } from "@/app/router/pages-map";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";
import { useNotification } from "@/shared/components/notification/use-notification";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { SettingsTemplatesSidebar } from "./settings-templates-sidebar";
import {
  DEFAULT_TEMPLATE_FORM_VALUES,
  toTemplateWritePayload,
  type TemplateFormValues,
} from "./template-form-fields";
import { TemplateFormModal } from "./template-form-modal";

export const SettingsTemplatesLayout = observer(() => {
  const { t } = useTranslation();
  const store = useMessageTemplatesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const isMobileViewport = useIsMobileViewport();
  const [form] = Form.useForm<TemplateFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const sortedTemplates = store.sortedVisibleTemplates;

  useEffect(() => {
    void store.loadTemplates();
    void store.loadVariables();
  }, [store]);

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

  useEffect(() => {
    if (isMobileViewport || store.listLoading || activeTemplateId == null) {
      return;
    }

    const isVisible = sortedTemplates.some(
      (item) => item.id === activeTemplateId,
    );

    if (!isVisible) {
      navigate(pagesMap.settingsTemplates, { replace: true });
    }
  }, [
    activeTemplateId,
    isMobileViewport,
    navigate,
    sortedTemplates,
    store.listLoading,
  ]);

  const openCreate = useCallback(() => {
    form.setFieldsValue(DEFAULT_TEMPLATE_FORM_VALUES);
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
      const created = await store.createTemplate(
        toTemplateWritePayload(values),
      );
      notification.success({ title: t("templates.created") });
      closeModal();
      if (created) {
        store.revealTemplateType(created.type);
        navigate(getSettingsTemplatePath(created.id));
      }
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("templates.createError")),
      });
      return Promise.reject();
    }
  }, [closeModal, form, notification, navigate, store, t]);

  const outletContext = {
    onCreateClick: openCreate,
  } satisfies SettingsTemplatesOutletContext;

  return (
    <>
      {isMobileViewport ? (
        <Outlet context={outletContext} />
      ) : (
        <PaneNavSplitLayout.Root
          $customWidth={360}
          data-qa="layout-settings-templates-shell"
        >
          <SettingsTemplatesSidebar
            templates={sortedTemplates}
            typeFilter={store.typeFilter}
            activeTemplateId={activeTemplateId}
            listLoading={store.listLoading}
            listError={store.listError}
            onTypeFilterChange={store.setTypeFilter}
            onCreateClick={openCreate}
            onTemplateClick={(templateId) =>
              navigate(getSettingsTemplatePath(templateId))
            }
          />

          <PaneNavSplitLayout.SubMain data-qa="layout-settings-templates-main">
            <Outlet context={outletContext} />
          </PaneNavSplitLayout.SubMain>
        </PaneNavSplitLayout.Root>
      )}

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
