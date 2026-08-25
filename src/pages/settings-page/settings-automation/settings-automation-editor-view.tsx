import { ArrowLeftIcon, CheckIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, Popconfirm, Switch, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import { AutomationEditorFallback } from "./automation-editor-fallback";
import { AutomationRuleFormFields } from "./automation-rule-form";
import { useAutomationEditor } from "./use-automation-editor";

const { Title, Text } = Typography;

export const SettingsAutomationEditorView = observer(() => {
  const { t } = useTranslation();
  const editor = useAutomationEditor();
  const isActive = Form.useWatch("isActive", editor.form) ?? false;

  if (editor.showFallback) {
    return <AutomationEditorFallback editor={editor} />;
  }

  return (
    <PaneDetailLayout.Root inset data-qa="layout-settings-automation-editor">
      <Form
        form={editor.form}
        layout="vertical"
        requiredMark
        onFinish={(values) => void editor.handleSubmit(values)}
        style={{ display: "contents" }}
        data-qa={`settings-automation-${editor.isCreate ? "create" : "edit"}-form`}
      >
        <PaneDetailLayout.Header data-qa="layout-settings-automation-editor-header">
          <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
            <Flex
              align="center"
              gap={4}
              style={{ minWidth: 0, flex: "1 1 280px" }}
            >
              <Button
                type="text"
                icon={<ArrowLeftIcon size={16} />}
                onClick={editor.navigateToList}
                data-qa="settings-automation-back"
              />
              <Title level={4} style={{ margin: 0 }}>
                {editor.title}
              </Title>
            </Flex>

            <Flex
              align="center"
              justify="flex-end"
              wrap="wrap"
              gap={16}
              style={{ flexShrink: 0 }}
            >
              <Flex align="center" gap={8}>
                <Form.Item
                  name="isActive"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Switch data-qa="settings-automation-active-switch" />
                </Form.Item>
                <Text type={isActive ? undefined : "secondary"}>
                  {isActive ? t("automation.active") : t("automation.inactive")}
                </Text>
              </Flex>

              {!editor.isCreate && (
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
              )}

              <Button
                type="primary"
                htmlType="submit"
                loading={editor.saveLoading}
                icon={<CheckIcon />}
                data-qa="settings-automation-save"
              >
                {t("automation.save")}
              </Button>
            </Flex>
          </Flex>
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body data-qa="layout-settings-automation-editor-body">
          <AutomationRuleFormFields
            form={editor.form}
            criteria={editor.criteria}
          />
        </PaneDetailLayout.Body>
      </Form>
    </PaneDetailLayout.Root>
  );
});
