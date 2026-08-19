import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import type {
  AutomationActionType,
  AutomationCriteria,
} from "@/features/automation/model/automation.types";
import { getConversationGroupDisplayName } from "@/features/conversation-groups/model/system-groups";
import { FormCard } from "@/components/layout/form-card";

import { AutomationConditionsFields } from "./automation-conditions-fields";
import {
  isOrderStatusEqualsTarget,
  type AutomationRuleFormValues,
} from "./automation-rule-form.utils";
import * as S from "./settings-automation.styled";

type AutomationRuleFormFieldsProps = {
  form: FormInstance<AutomationRuleFormValues>;
  criteria: AutomationCriteria | null;
};

export const AutomationRuleFormFields = ({
  form,
  criteria,
}: AutomationRuleFormFieldsProps) => {
  const { t } = useTranslation();
  const actionType = (Form.useWatch("actionType", form) ??
    "CHANGE_ORDER_STATUS") as AutomationActionType;
  const isConversationGroupAction =
    actionType === "CHANGE_CONVERSATION_GROUP";

  const handleActionTypeChange = (nextType: AutomationActionType) => {
    form.setFieldValue("actionType", nextType);

    if (nextType === "CHANGE_CONVERSATION_GROUP") {
      form.setFieldValue("targetOrderStatusId", undefined);
      return;
    }

    form.setFieldValue("targetConversationGroupId", undefined);
  };

  const actionTypeOptions = [
    {
      value: "CHANGE_ORDER_STATUS",
      label: t("automation.actionType.changeOrderStatus"),
    },
    {
      value: "CHANGE_CONVERSATION_GROUP",
      label: t("automation.actionType.changeConversationGroup"),
    },
  ];

  const actionOptions = [
    {
      value: "CHANGE_ORDER_STATUS",
      label: t("automation.action.changeOrderStatus"),
    },
    {
      value: "CHANGE_CONVERSATION_GROUP",
      label: t("automation.action.changeConversationGroup"),
    },
  ];

  return (
    <S.FormRoot>
      <FormCard>
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
              options={actionTypeOptions}
              onChange={handleActionTypeChange}
              data-qa="settings-automation-action-type"
            />
          </Form.Item>
        </S.TypeRow>

        <S.SectionDivider />

        <Form.Item name="conditionType" hidden>
          <Input />
        </Form.Item>

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
            value={actionType}
            options={actionOptions}
            onChange={handleActionTypeChange}
            data-qa="settings-automation-then-action"
          />
          {isConversationGroupAction ? (
            <Form.Item
              name="targetConversationGroupId"
              rules={[
                {
                  required: true,
                  message: t("automation.validation.targetGroup"),
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder={t("automation.placeholders.targetGroup")}
                options={(criteria?.conversationGroups ?? []).map((group) => ({
                  value: group.id,
                  label: getConversationGroupDisplayName(group, t),
                }))}
                showSearch
                optionFilterProp="label"
                data-qa="settings-automation-target-group"
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="targetOrderStatusId"
              dependencies={["conditions"]}
              rules={[
                {
                  required: true,
                  message: t("automation.validation.targetStatus"),
                },
                {
                  validator: async (_, targetOrderStatusId?: number) => {
                    const conditions = (form.getFieldValue("conditions") ??
                      []) as AutomationRuleFormValues["conditions"];
                    const hasNoop = conditions.some((condition) =>
                      isOrderStatusEqualsTarget(condition, targetOrderStatusId),
                    );

                    if (hasNoop) {
                      throw new Error(t("automation.validation.eqSameAsTarget"));
                    }
                  },
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
          )}
        </S.ActionRow>
      </FormCard>
    </S.FormRoot>
  );
};
