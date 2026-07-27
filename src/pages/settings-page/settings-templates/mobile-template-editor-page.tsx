import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Alert, Button, Form, Input, Popconfirm } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { getTemplateCharacterCount } from "./settings-templates.utils";
import * as S from "./mobile-template-editor-page.styled";
import { TemplateBodyField } from "./template-body-field";
import { useSettingsTemplateEditor } from "./use-settings-template-editor";

export const MobileTemplateEditorPage = observer(() => {
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
      <S.Root>
        <S.StateContainer>
          <Alert type="error" title={t("templates.invalidTemplate")} showIcon />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (isLoading) {
    return (
      <S.Root>
        <S.StateContainer>
          <CenteredSpinner />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (isNotFound) {
    return (
      <S.Root>
        <S.StateContainer>
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
        </S.StateContainer>
      </S.Root>
    );
  }

  if (!template) {
    return null;
  }

  const pageTitle =
    template.name.trim() || t("templates.mobile.editorFallbackTitle");

  return (
    <S.Root>
      <S.PageHeader>
        <S.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          data-qa="settings-mobile-template-back"
          onClick={navigateToTemplates}
        >
          {t("templates.backToTemplates")}
        </S.BackButton>

        <S.HeaderRow align="center" gap={8}>
          <S.PageTitle level={4}>{pageTitle}</S.PageTitle>
        </S.HeaderRow>
      </S.PageHeader>

      <S.ScrollRegion>
        <S.FormSection>
          <Form
            form={form}
            layout="vertical"
            requiredMark
            onFinish={() => void handleSave()}
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
              <TemplateBodyField
                rows={8}
                data-qa="settings-mobile-template-body"
              />
            </Form.Item>
          </Form>
        </S.FormSection>

        <S.StickyFooter>
          <S.FooterActions vertical gap={8}>
            <Button
              type="primary"
              block
              loading={store.saveLoading}
              data-qa="settings-mobile-template-save"
              onClick={() => void handleSave()}
            >
              {t("templates.saveChanges")}
            </Button>
            <Popconfirm
              title={t("templates.deleteConfirmTitle")}
              okText={t("templates.delete")}
              okButtonProps={{
                danger: true,
                loading: store.deleteLoadingId === template.id,
              }}
              onConfirm={() => void handleDelete()}
            >
              <Button
                danger
                block
                loading={store.deleteLoadingId === template.id}
                data-qa="settings-mobile-template-delete"
                aria-label={t("templates.mobile.deleteAria")}
              >
                {t("templates.delete")}
              </Button>
            </Popconfirm>
          </S.FooterActions>
        </S.StickyFooter>
      </S.ScrollRegion>
    </S.Root>
  );
});
