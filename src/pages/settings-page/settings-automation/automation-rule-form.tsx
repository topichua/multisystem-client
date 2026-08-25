import { Checkbox, Form, Input, InputNumber, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import type {
  AutomationActionType,
  AutomationCriteria,
  AutomationDurationUnit,
} from "@/features/automation/model/automation.types";
import { getConversationGroupDisplayName } from "@/features/conversation-groups/model/system-groups";
import { FormCard } from "@/components/layout/form-card";

import { AutomationConditionsFields } from "./automation-conditions-fields";
import {
  ACTION_DELAY_NONE,
  ACTION_DELAY_UNITS,
  createDefaultSendMessageActionValues,
  createEmptyCondition,
  isOrderStatusEqualsTarget,
  type AutomationActionDelayUnitValue,
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
  const actionDelayUnit = (Form.useWatch("actionDelayUnit", form) ??
    ACTION_DELAY_NONE) as AutomationActionDelayUnitValue;
  const isConversationGroupAction = actionType === "CHANGE_CONVERSATION_GROUP";
  const isSendMessageAction = actionType === "SEND_MESSAGE";
  const hasActionDelay =
    isSendMessageAction &&
    actionDelayUnit != null &&
    actionDelayUnit !== ACTION_DELAY_NONE;

  const handleActionTypeChange = (nextType: AutomationActionType) => {
    const conditions = (form.getFieldValue("conditions") ??
      []) as AutomationRuleFormValues["conditions"];

    if (nextType === "SEND_MESSAGE") {
      form.setFieldsValue({
        actionType: nextType,
        targetOrderStatusId: undefined,
        targetConversationGroupId: undefined,
        ...createDefaultSendMessageActionValues(),
        ...(conditions.length === 0
          ? { conditions: [createEmptyCondition()] }
          : {}),
      });
      return;
    }

    form.setFieldsValue({
      actionType: nextType,
      targetTemplateId: undefined,
      actionDelayValue: null,
      actionDelayUnit: ACTION_DELAY_NONE,
      waitForBusinessHours: false,
      ...(nextType === "CHANGE_CONVERSATION_GROUP"
        ? { targetOrderStatusId: undefined }
        : { targetConversationGroupId: undefined }),
      ...(conditions.length === 0
        ? { conditions: [createEmptyCondition()] }
        : {}),
    });
  };

  const handleDelayUnitChange = (nextUnit: AutomationActionDelayUnitValue) => {
    if (nextUnit === ACTION_DELAY_NONE) {
      form.setFieldsValue({
        actionDelayUnit: ACTION_DELAY_NONE,
        actionDelayValue: null,
      });
      return;
    }

    const currentValue = form.getFieldValue("actionDelayValue") as
      number | null | undefined;

    form.setFieldsValue({
      actionDelayUnit: nextUnit,
      actionDelayValue: currentValue ?? 1,
    });
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
    {
      value: "SEND_MESSAGE",
      label: t("automation.actionType.sendMessage"),
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
    {
      value: "SEND_MESSAGE",
      label: t("automation.action.sendMessage"),
    },
  ];

  const delayUnitOptions = [
    {
      value: ACTION_DELAY_NONE,
      label: t("automation.delay.modes.immediately"),
    },
    ...ACTION_DELAY_UNITS.map((unit) => ({
      value: unit,
      label: t(`automation.delay.modes.${unit.toLowerCase()}`),
    })),
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
            disabled
            data-qa="settings-automation-then-action"
          />
          {isSendMessageAction ? (
            <Form.Item
              name="targetTemplateId"
              rules={[
                {
                  required: true,
                  message: t("automation.validation.targetTemplate"),
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder={t("automation.placeholders.targetTemplate")}
                options={(criteria?.orderTemplates ?? []).map((template) => ({
                  value: template.id,
                  label: template.name,
                }))}
                showSearch
                optionFilterProp="label"
                notFoundContent={t("automation.emptyTemplates")}
                data-qa="settings-automation-target-template"
              />
            </Form.Item>
          ) : isConversationGroupAction ? (
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
                      throw new Error(
                        t("automation.validation.eqSameAsTarget"),
                      );
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

        {isSendMessageAction && (
          <>
            <S.SendMessageDelayRow>
              <Form.Item name="actionDelayUnit" style={{ marginBottom: 0 }}>
                <Select
                  options={delayUnitOptions}
                  onChange={handleDelayUnitChange}
                  data-qa="settings-automation-action-delay-unit"
                />
              </Form.Item>

              {hasActionDelay && (
                <>
                  <Form.Item
                    name="actionDelayValue"
                    rules={[
                      {
                        required: true,
                        message: t("automation.validation.durationValue"),
                      },
                      {
                        type: "number",
                        min: 1,
                        message: t("automation.validation.durationValue"),
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      min={1}
                      precision={0}
                      style={{ width: 72 }}
                      data-qa="settings-automation-action-delay-value"
                    />
                  </Form.Item>
                  <S.SendMessageDelaySuffix>
                    {t("automation.delay.afterTrigger", {
                      unit: t(
                        `automation.delay.afterTriggerUnits.${(
                          actionDelayUnit as AutomationDurationUnit
                        ).toLowerCase()}`,
                      ),
                    })}
                  </S.SendMessageDelaySuffix>
                </>
              )}
            </S.SendMessageDelayRow>

            <S.SendMessageHoursRow>
              <Form.Item
                name="waitForBusinessHours"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Checkbox data-qa="settings-automation-wait-for-business-hours">
                  {t("automation.fields.waitForBusinessHours")}
                </Checkbox>
              </Form.Item>
            </S.SendMessageHoursRow>
          </>
        )}
      </FormCard>
    </S.FormRoot>
  );
};
