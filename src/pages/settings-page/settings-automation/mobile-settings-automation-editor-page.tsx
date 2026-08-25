import { ArrowLeftIcon, CheckIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, Popconfirm, Switch, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

import * as MobileS from "../mobile-settings-page.styled";
import { AutomationEditorFallback } from "./automation-editor-fallback";
import { AutomationRuleFormFields } from "./automation-rule-form";
import { useAutomationEditor } from "./use-automation-editor";
import * as S from "./settings-automation.styled";

const { Text } = Typography;

export const MobileSettingsAutomationEditorPage = observer(() => {
  const { t } = useTranslation();
  const editor = useAutomationEditor();
  const isActive = Form.useWatch("isActive", editor.form) ?? false;

  if (editor.showFallback) {
    return (
      <MobileS.Root {...dataQaAttrs("settings-mobile-automation-editor")}>
        <AutomationEditorFallback editor={editor} />
      </MobileS.Root>
    );
  }

  return (
    <MobileS.Root {...dataQaAttrs("settings-mobile-automation-editor")}>
      <Form
        form={editor.form}
        layout="vertical"
        requiredMark
        onFinish={(values) => void editor.handleSubmit(values)}
        style={{ display: "contents" }}
        data-qa={`settings-automation-${editor.isCreate ? "create" : "edit"}-form`}
      >
        <MobileS.PageHeader>
          <MobileS.BackButton
            type="text"
            icon={<ArrowLeftIcon size={16} />}
            onClick={editor.navigateToList}
            data-qa="settings-automation-back"
          >
            {t("automation.backToList")}
          </MobileS.BackButton>

          <MobileS.TitleRow>
            <MobileS.PageTitle level={3}>{editor.title}</MobileS.PageTitle>
          </MobileS.TitleRow>

          <S.MobileEditorActions>
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

            <Button
              type="primary"
              htmlType="submit"
              loading={editor.saveLoading}
              icon={<CheckIcon />}
              data-qa="settings-automation-save"
            >
              {t("automation.save")}
            </Button>
          </S.MobileEditorActions>
        </MobileS.PageHeader>

        <MobileS.ScrollRegion>
          <MobileS.ContentSection>
            <AutomationRuleFormFields
              form={editor.form}
              criteria={editor.criteria}
            />

            {!editor.isCreate && (
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
            )}
          </MobileS.ContentSection>
        </MobileS.ScrollRegion>
      </Form>
    </MobileS.Root>
  );
});
