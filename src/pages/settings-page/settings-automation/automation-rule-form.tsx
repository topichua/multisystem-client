import {
  Checkbox,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import {
  AUTOMATION_ACTION_LABEL_KEYS,
  AUTOMATION_ACTION_TYPES,
  AUTOMATION_ACTION_TYPE_LABEL_KEYS,
  AUTOMATION_DURATION_AFTER_TRIGGER_LABEL_KEYS,
  AUTOMATION_DURATION_MODE_LABEL_KEYS,
  AUTOMATION_DURATION_UNITS,
  DEFAULT_AUTOMATION_ACTION_TYPE,
  type AutomationActionType,
  type AutomationCriteria,
} from "@/features/automation/model/automation.types";
import { FormCard, FormDivider } from "@/components/layout/form-card";

import {
  AUTOMATION_ACTION_FORM_CONFIGS,
  getActionTypeChangeValues,
} from "./automation-action-form-config";
import { AutomationConditionsFields } from "./automation-conditions-fields";
import {
  ACTION_DELAY_NONE,
  hasEqSameAsTargetConflict,
  type AutomationActionDelayUnitValue,
  type AutomationRuleFormValues,
} from "./automation-rule-form.utils";
import * as S from "./settings-automation.styled";

const { Text } = Typography;

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
    DEFAULT_AUTOMATION_ACTION_TYPE) as AutomationActionType;
  const actionDelayUnit = (Form.useWatch("actionDelayUnit", form) ??
    ACTION_DELAY_NONE) as AutomationActionDelayUnitValue;
  const actionConfig = AUTOMATION_ACTION_FORM_CONFIGS[actionType];
  const hasActionDelay =
    actionConfig.extras === "sendMessage" &&
    actionDelayUnit != null &&
    actionDelayUnit !== ACTION_DELAY_NONE;

  const handleActionTypeChange = (nextType: AutomationActionType) => {
    const conditions = (form.getFieldValue("conditions") ??
      []) as AutomationRuleFormValues["conditions"];

    form.setFieldsValue(getActionTypeChangeValues(nextType, conditions));
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

  const actionTypeOptions = AUTOMATION_ACTION_TYPES.map((value) => ({
    value,
    label: t(AUTOMATION_ACTION_TYPE_LABEL_KEYS[value]),
  }));

  const delayUnitOptions = [
    {
      value: ACTION_DELAY_NONE,
      label: t("automation.delay.modes.immediately"),
    },
    ...AUTOMATION_DURATION_UNITS.map((unit) => ({
      value: unit,
      label: t(AUTOMATION_DURATION_MODE_LABEL_KEYS[unit]),
    })),
  ];

  return (
    <FormCard style={{ minWidth: 0 }}>
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

      <FormDivider />

      <S.TypeRow>
        <Text strong>{t("automation.fields.type")}</Text>
        <Form.Item name="actionType" style={{ marginBottom: 0 }}>
          <Select
            options={actionTypeOptions}
            onChange={handleActionTypeChange}
            data-qa="settings-automation-action-type"
          />
        </Form.Item>
      </S.TypeRow>

      <FormDivider />

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

      <FormDivider />

      <S.LogicBadge $tone="then">{t("automation.thenBadge")}</S.LogicBadge>

      <S.ActionRow>
        <S.ThenActionLabel data-qa="settings-automation-then-action">
          {t(AUTOMATION_ACTION_LABEL_KEYS[actionType])}
        </S.ThenActionLabel>
        <Form.Item
          name={actionConfig.targetField}
          dependencies={
            actionConfig.validateEqSameAsTarget ? ["conditions"] : undefined
          }
          rules={[
            {
              required: true,
              message: t(`automation.validation.${actionConfig.validationKey}`),
            },
            ...(actionConfig.validateEqSameAsTarget
              ? [
                  {
                    validator: async (
                      _: unknown,
                      targetOrderStatusId?: number,
                    ) => {
                      if (
                        hasEqSameAsTargetConflict(
                          form.getFieldValue("actionType"),
                          form.getFieldValue("conditions"),
                          targetOrderStatusId,
                        )
                      ) {
                        throw new Error(
                          t("automation.validation.eqSameAsTarget"),
                        );
                      }
                    },
                  },
                ]
              : []),
          ]}
          style={{ marginBottom: 0 }}
        >
          <Select
            placeholder={t(
              `automation.placeholders.${actionConfig.placeholderKey}`,
            )}
            options={actionConfig.getOptions(criteria, t)}
            showSearch
            optionFilterProp="label"
            notFoundContent={
              actionConfig.notFoundContentKey
                ? t(actionConfig.notFoundContentKey)
                : undefined
            }
            data-qa={actionConfig.qa}
          />
        </Form.Item>
      </S.ActionRow>

      {actionConfig.extras === "sendMessage" && (
        <>
          <Flex align="center" gap={12} wrap="wrap" style={{ marginTop: 12 }}>
            <Form.Item name="actionDelayUnit" style={{ marginBottom: 0 }}>
              <Select
                options={delayUnitOptions}
                onChange={handleDelayUnitChange}
                style={{ minWidth: 200 }}
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
                <Text style={{ whiteSpace: "nowrap" }}>
                  {t("automation.delay.afterTrigger", {
                    unit: t(
                      AUTOMATION_DURATION_AFTER_TRIGGER_LABEL_KEYS[
                        actionDelayUnit
                      ],
                    ),
                  })}
                </Text>
              </>
            )}
          </Flex>

          <Form.Item
            name="waitForBusinessHours"
            valuePropName="checked"
            style={{ marginBottom: 0, marginTop: 16 }}
          >
            <Checkbox data-qa="settings-automation-wait-for-business-hours">
              {t("automation.fields.waitForBusinessHours")}
            </Checkbox>
          </Form.Item>
        </>
      )}
    </FormCard>
  );
};
