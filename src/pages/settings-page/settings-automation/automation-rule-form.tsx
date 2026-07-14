import { ArrowLeftIcon, CheckIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, Input, Select, Switch } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import type { AutomationCriteria } from "@/features/automation/model/automation.types";
import { FormCard } from "@/components/layout/form-card.styled";

import { AutomationConditionsFields } from "./automation-conditions-fields";
import type { AutomationRuleFormValues } from "./automation-rule-form.utils";
import * as S from "./settings-automation.styled";

type AutomationRuleFormProps = {
  form: FormInstance<AutomationRuleFormValues>;
  mode: "create" | "edit";
  title: string;
  criteria: AutomationCriteria | null;
  saveLoading: boolean;
  onBack: () => void;
  onSubmit: (values: AutomationRuleFormValues) => void;
};

export const AutomationRuleForm = ({
  form,
  mode,
  title,
  criteria,
  saveLoading,
  onBack,
  onSubmit,
}: AutomationRuleFormProps) => {
  const { t } = useTranslation();

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark
      onFinish={onSubmit}
      data-qa={`settings-automation-${mode}-form`}
    >
      <S.FormRoot>
        <S.BackButton
          type="link"
          icon={<ArrowLeftIcon size={16} />}
          onClick={onBack}
          data-qa="settings-automation-back"
        >
          {t("automation.backToList")}
        </S.BackButton>

        <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
          <S.HeaderTitle level={4}>{title}</S.HeaderTitle>
          <S.HeaderActions>
            <Flex align="center" gap={8}>
              <Form.Item
                name="isActive"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch data-qa="settings-automation-active-switch" />
              </Form.Item>
              <S.ActiveLabel>{t("automation.active")}</S.ActiveLabel>
            </Flex>
            <Button
              type="primary"
              htmlType="submit"
              loading={saveLoading}
              icon={<CheckIcon />}
              data-qa="settings-automation-save"
            >
              {t("automation.save")}
            </Button>
          </S.HeaderActions>
        </Flex>

        <FormCard style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label={t("automation.fields.name")}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t("automation.validation.name"),
              },
            ]}
          >
            <Input
              placeholder={t("automation.placeholders.name")}
              data-qa="settings-automation-name"
            />
          </Form.Item>

          <S.SectionDivider />

          <S.TypeRow>
            <S.TypeLabel>{t("automation.fields.type")}</S.TypeLabel>
            <Form.Item name="actionType" style={{ marginBottom: 0 }}>
              <Select
                disabled
                options={[
                  {
                    value: "CHANGE_ORDER_STATUS",
                    label: t("automation.actionType.changeOrderStatus"),
                  },
                ]}
              />
            </Form.Item>
          </S.TypeRow>

          <S.SectionDivider />

          <Form.List
            name="conditions"
            rules={[
              {
                validator: async (_, value) => {
                  if (!Array.isArray(value) || value.length < 1) {
                    throw new Error(t("automation.validation.conditions"));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                <AutomationConditionsFields
                  form={form}
                  criteria={criteria}
                  fields={fields}
                  add={add}
                  remove={remove}
                />
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>

          <S.SectionDivider />

          <S.LogicBadge $tone="then">{t("automation.thenBadge")}</S.LogicBadge>

          <S.ActionRow>
            <Select
              disabled
              value="CHANGE_ORDER_STATUS"
              options={[
                {
                  value: "CHANGE_ORDER_STATUS",
                  label: t("automation.action.changeOrderStatus"),
                },
              ]}
            />
            <Form.Item
              name="targetOrderStatusId"
              rules={[
                {
                  required: true,
                  message: t("automation.validation.targetStatus"),
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder={t("automation.placeholders.targetStatus")}
                options={(criteria?.statuses ?? []).map((status) => ({
                  value: status.id,
                  label: status.name,
                }))}
                showSearch
                optionFilterProp="label"
                data-qa="settings-automation-target-status"
              />
            </Form.Item>
          </S.ActionRow>
        </FormCard>
      </S.FormRoot>
    </Form>
  );
};
