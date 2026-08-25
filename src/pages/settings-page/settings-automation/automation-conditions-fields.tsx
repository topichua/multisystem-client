import { PlusIcon, XIcon } from "@phosphor-icons/react";
import {
  Button,
  Flex,
  Form,
  InputNumber,
  Select,
  Typography,
  type FormInstance,
  type FormListFieldData,
} from "antd";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { getAutomationSourceStatusOptions } from "@/features/automation/model/automation-criteria-options";
import {
  AUTOMATION_OPERATORS,
  AUTOMATION_OPERATOR_LABEL_KEYS,
  AUTOMATION_SOURCE_TYPES,
  AUTOMATION_SOURCE_TYPE_LABEL_KEYS,
  DEFAULT_AUTOMATION_CONDITION_TYPE,
  DEFAULT_AUTOMATION_OPERATOR,
  DEFAULT_AUTOMATION_SOURCE_TYPE,
  type AutomationConditionType,
  type AutomationCriteria,
} from "@/features/automation/model/automation.types";

import {
  AT_BRANCH_SOURCE_STATUS,
  createEmptyCondition,
  hasEqSameAsTargetConflict,
  isAtBranchCondition,
  type AutomationConditionFormValue,
  type AutomationRuleFormValues,
} from "./automation-rule-form.utils";
import * as S from "./settings-automation.styled";

const { Text } = Typography;

const ITEM_NO_MARGIN = { marginBottom: 0 };

const getSourceTypeOptions = (t: TFunction) =>
  AUTOMATION_SOURCE_TYPES.map((value) => ({
    value,
    label: t(AUTOMATION_SOURCE_TYPE_LABEL_KEYS[value]),
  }));

const getOperatorOptions = (t: TFunction) =>
  AUTOMATION_OPERATORS.map((value) => ({
    value,
    label: t(AUTOMATION_OPERATOR_LABEL_KEYS[value]),
  }));

const getStatusOptions = (
  sourceType: AutomationConditionFormValue["sourceType"] | undefined,
  criteria: AutomationCriteria | null,
) =>
  getAutomationSourceStatusOptions(sourceType, criteria).map((option) => ({
    value: option.id,
    label: option.name,
  }));

const patchCondition = (
  form: FormInstance<AutomationRuleFormValues>,
  index: number,
  patch: Partial<AutomationConditionFormValue>,
) => {
  const conditions = (form.getFieldValue("conditions") ??
    []) as AutomationConditionFormValue[];

  form.setFieldsValue({
    conditions: conditions.map((condition, conditionIndex) =>
      conditionIndex === index ? { ...condition, ...patch } : condition,
    ),
  });
};

type AutomationConditionsFieldsProps = {
  form: FormInstance<AutomationRuleFormValues>;
  criteria: AutomationCriteria | null;
  fields: FormListFieldData[];
  add: (defaultValue?: AutomationConditionFormValue) => void;
  remove: (index: number | number[]) => void;
};

export const AutomationConditionsFields = ({
  form,
  criteria,
  fields,
  add,
  remove,
}: AutomationConditionsFieldsProps) => {
  const { t } = useTranslation();
  const conditionType = (Form.useWatch("conditionType", form) ??
    DEFAULT_AUTOMATION_CONDITION_TYPE) as AutomationConditionType;

  const toggleConditionType = () => {
    const nextType: AutomationConditionType =
      conditionType === "OR" ? "AND" : "OR";
    form.setFieldsValue({ conditionType: nextType });
  };

  return (
    <>
      <S.LogicBadge $tone="if">{t("automation.ifBadge")}</S.LogicBadge>

      <Flex vertical gap={12} style={{ marginTop: 16 }}>
        {fields.map((field, index) => (
          <ConditionBlock
            key={field.key}
            form={form}
            field={field}
            index={index}
            canRemove={fields.length > 1}
            criteria={criteria}
            conditionType={conditionType}
            onToggleType={toggleConditionType}
            onRemove={() => remove(field.name)}
          />
        ))}

        <Button
          type="link"
          icon={<PlusIcon />}
          onClick={() => add(createEmptyCondition())}
          data-qa="settings-automation-add-condition"
          style={{ alignSelf: "flex-start", paddingInline: 0, height: "auto" }}
        >
          {t("automation.addCondition")}
        </Button>
      </Flex>
    </>
  );
};

type ConditionBlockProps = {
  form: FormInstance<AutomationRuleFormValues>;
  field: FormListFieldData;
  index: number;
  canRemove: boolean;
  criteria: AutomationCriteria | null;
  conditionType: AutomationConditionType;
  onToggleType: () => void;
  onRemove: () => void;
};

const ConditionBlock = ({
  form,
  field,
  index,
  canRemove,
  criteria,
  conditionType,
  onToggleType,
  onRemove,
}: ConditionBlockProps) => {
  const { t } = useTranslation();
  const sourceType = Form.useWatch(
    ["conditions", field.name, "sourceType"],
    form,
  ) as AutomationConditionFormValue["sourceType"] | undefined;
  const sourceStatus = Form.useWatch(
    ["conditions", field.name, "sourceStatus"],
    form,
  ) as string | undefined;
  const durationValue = Form.useWatch(
    ["conditions", field.name, "durationValue"],
    form,
  ) as number | null | undefined;

  const showAtBranchExtensionUi =
    sourceType != null &&
    isAtBranchCondition({
      sourceType,
      sourceStatus,
    });
  const isAtBranchExtensionOpen =
    showAtBranchExtensionUi && durationValue != null;

  const clearExtension = () => {
    patchCondition(form, field.name, { durationValue: null });
  };

  return (
    <Flex vertical gap={8}>
      {index > 0 && (
        <Button
          color="primary"
          variant="outlined"
          size="small"
          shape="round"
          onClick={onToggleType}
          aria-label={t("automation.logic.toggleAria")}
          data-qa="settings-automation-condition-type"
          style={{ alignSelf: "flex-start", fontWeight: 600 }}
        >
          {t(
            conditionType === "AND"
              ? "automation.logic.and"
              : "automation.logic.or",
          )}
        </Button>
      )}

      <S.ConditionRow>
        <Form.Item
          name={[field.name, "sourceType"]}
          rules={[
            {
              required: true,
              message: t("automation.validation.sourceType"),
            },
          ]}
          style={ITEM_NO_MARGIN}
        >
          <Select
            options={getSourceTypeOptions(t)}
            onChange={() => {
              patchCondition(form, field.name, {
                sourceStatus: undefined,
                durationValue: null,
              });
            }}
          />
        </Form.Item>

        <Form.Item
          name={[field.name, "operator"]}
          rules={[
            {
              required: true,
              message: t("automation.validation.operator"),
            },
          ]}
          style={ITEM_NO_MARGIN}
        >
          <Select
            options={getOperatorOptions(t)}
            data-qa="settings-automation-operator"
          />
        </Form.Item>

        <Form.Item
          name={[field.name, "sourceStatus"]}
          dependencies={[
            "actionType",
            "targetOrderStatusId",
            ["conditions", field.name, "operator"],
            ["conditions", field.name, "sourceType"],
          ]}
          rules={[
            {
              required: true,
              message: t("automation.validation.sourceStatus"),
            },
            {
              validator: async (_, value?: string) => {
                const condition = form.getFieldValue([
                  "conditions",
                  field.name,
                ]) as AutomationConditionFormValue | undefined;

                if (
                  hasEqSameAsTargetConflict(
                    form.getFieldValue("actionType"),
                    [
                      {
                        sourceType:
                          condition?.sourceType ??
                          DEFAULT_AUTOMATION_SOURCE_TYPE,
                        sourceStatus: value,
                        operator:
                          condition?.operator ?? DEFAULT_AUTOMATION_OPERATOR,
                      },
                    ],
                    form.getFieldValue("targetOrderStatusId"),
                  )
                ) {
                  throw new Error(t("automation.validation.eqSameAsTarget"));
                }
              },
            },
          ]}
          style={ITEM_NO_MARGIN}
        >
          <Select
            placeholder={t("automation.placeholders.sourceStatus")}
            options={getStatusOptions(sourceType, criteria)}
            showSearch
            optionFilterProp="label"
            onChange={(value: string) => {
              if (value !== AT_BRANCH_SOURCE_STATUS) {
                clearExtension();
              }
            }}
          />
        </Form.Item>

        <Button
          type="text"
          disabled={!canRemove}
          aria-label={t("automation.removeConditionAria")}
          onClick={onRemove}
          data-qa="settings-automation-remove-condition"
          icon={<XIcon size={16} />}
        />
      </S.ConditionRow>

      {showAtBranchExtensionUi && (
        <AtBranchDurationExtension
          field={field}
          isOpen={isAtBranchExtensionOpen}
          onOpen={() => patchCondition(form, field.name, { durationValue: 3 })}
          onClear={clearExtension}
        />
      )}
    </Flex>
  );
};

type AtBranchDurationExtensionProps = {
  field: FormListFieldData;
  isOpen: boolean;
  onOpen: () => void;
  onClear: () => void;
};

const AtBranchDurationExtension = ({
  field,
  isOpen,
  onOpen,
  onClear,
}: AtBranchDurationExtensionProps) => {
  const { t } = useTranslation();

  return (
    <>
      {!isOpen && (
        <Button
          color="primary"
          variant="dashed"
          icon={<PlusIcon size={16} />}
          data-qa="settings-automation-add-at-branch-extension"
          onClick={onOpen}
          style={{ alignSelf: "flex-start", marginTop: 4 }}
        >
          {t("automation.atBranchExtension.add")}
        </Button>
      )}

      <Flex
        align="center"
        gap={8}
        aria-hidden={!isOpen}
        style={{ marginTop: 8, display: isOpen ? "flex" : "none" }}
      >
        <S.AtBranchExtensionPrefix>
          <PlusIcon size={14} />
        </S.AtBranchExtensionPrefix>

        <Text style={{ flexShrink: 0 }}>
          {t("automation.atBranchExtension.moreThan")}
        </Text>

        <Form.Item
          name={[field.name, "durationValue"]}
          rules={
            isOpen
              ? [
                  {
                    required: true,
                    message: t("automation.validation.durationValue"),
                  },
                  {
                    type: "number",
                    min: 1,
                    message: t("automation.validation.durationValue"),
                  },
                ]
              : []
          }
          style={ITEM_NO_MARGIN}
        >
          <InputNumber
            min={1}
            precision={0}
            style={{ width: 72 }}
            data-qa="settings-automation-at-branch-days"
          />
        </Form.Item>

        <Text style={{ flexShrink: 0 }}>
          {t("automation.atBranchExtension.days")}
        </Text>

        <Button
          type="text"
          aria-label={t("automation.atBranchExtension.removeAria")}
          onClick={onClear}
          data-qa="settings-automation-remove-at-branch-extension"
          icon={<XIcon size={16} />}
        />
      </Flex>
    </>
  );
};
