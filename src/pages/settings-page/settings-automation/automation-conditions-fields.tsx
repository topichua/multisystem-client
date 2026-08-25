import { PlusIcon, XIcon } from "@phosphor-icons/react";
import {
  Form,
  InputNumber,
  Select,
  type FormInstance,
  type FormListFieldData,
} from "antd";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import type {
  AutomationConditionType,
  AutomationCriteria,
} from "@/features/automation/model/automation.types";

import {
  AT_BRANCH_SOURCE_STATUS,
  createEmptyCondition,
  DEFAULT_AUTOMATION_OPERATOR,
  isAtBranchCondition,
  isOrderStatusEqualsTarget,
  type AutomationConditionFormValue,
  type AutomationRuleFormValues,
} from "./automation-rule-form.utils";
import * as S from "./settings-automation.styled";

const ITEM_NO_MARGIN = { marginBottom: 0 };

const getSourceTypeOptions = (t: TFunction) => [
  {
    value: "DELIVERY_STATUS",
    label: t("automation.sourceType.delivery"),
  },
  {
    value: "PAYMENT_STATUS",
    label: t("automation.sourceType.payment"),
  },
  {
    value: "ORDER_STATUS",
    label: t("automation.sourceType.order"),
  },
];

const getOperatorOptions = (t: TFunction) => [
  {
    value: "EQ",
    label: t("automation.operator.eq"),
  },
  {
    value: "NEQ",
    label: t("automation.operator.neq"),
  },
];

const getStatusOptions = (
  sourceType: AutomationConditionFormValue["sourceType"] | undefined,
  criteria: AutomationCriteria | null,
) => {
  if (sourceType === "PAYMENT_STATUS") {
    return (criteria?.payment ?? []).map((option) => ({
      value: option.id,
      label: option.name,
    }));
  }

  if (sourceType === "ORDER_STATUS") {
    return (criteria?.statuses ?? []).map((option) => ({
      value: String(option.id),
      label: option.name,
    }));
  }

  return (criteria?.delivery ?? []).map((option) => ({
    value: option.id,
    label: option.name,
  }));
};

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
    "OR") as AutomationConditionType;

  const toggleConditionType = () => {
    const nextType: AutomationConditionType =
      conditionType === "OR" ? "AND" : "OR";
    form.setFieldsValue({ conditionType: nextType });
  };

  return (
    <>
      <S.LogicBadge $tone="if">{t("automation.ifBadge")}</S.LogicBadge>

      <S.ConditionsStack>
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
      </S.ConditionsStack>

      <S.AddConditionButton
        type="link"
        icon={<PlusIcon />}
        onClick={() => add(createEmptyCondition())}
        data-qa="settings-automation-add-condition"
      >
        {t("automation.addCondition")}
      </S.AddConditionButton>
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
    <S.ConditionBlock>
      {index > 0 && (
        <S.OrConnector
          type="button"
          onClick={onToggleType}
          aria-label={t("automation.logic.toggleAria")}
          data-qa="settings-automation-condition-type"
        >
          {t(
            conditionType === "AND"
              ? "automation.logic.and"
              : "automation.logic.or",
          )}
        </S.OrConnector>
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
                if (
                  form.getFieldValue("actionType") !== "CHANGE_ORDER_STATUS"
                ) {
                  return;
                }

                const condition = form.getFieldValue([
                  "conditions",
                  field.name,
                ]) as AutomationConditionFormValue | undefined;

                if (
                  isOrderStatusEqualsTarget(
                    {
                      sourceType: condition?.sourceType ?? "DELIVERY_STATUS",
                      sourceStatus: value,
                      operator:
                        condition?.operator ?? DEFAULT_AUTOMATION_OPERATOR,
                    },
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

        <S.RemoveConditionButton
          type="button"
          disabled={!canRemove}
          aria-label={t("automation.removeConditionAria")}
          onClick={onRemove}
          data-qa="settings-automation-remove-condition"
        >
          <XIcon size={16} />
        </S.RemoveConditionButton>
      </S.ConditionRow>

      {showAtBranchExtensionUi && (
        <AtBranchDurationExtension
          field={field}
          isOpen={isAtBranchExtensionOpen}
          onOpen={() => patchCondition(form, field.name, { durationValue: 3 })}
          onClear={clearExtension}
        />
      )}
    </S.ConditionBlock>
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
        <S.AtBranchExtensionCta
          type="button"
          data-qa="settings-automation-add-at-branch-extension"
          onClick={onOpen}
        >
          <PlusIcon size={16} />
          {t("automation.atBranchExtension.add")}
        </S.AtBranchExtensionCta>
      )}

      <S.AtBranchExtensionRow $open={isOpen} aria-hidden={!isOpen}>
        <S.AtBranchExtensionPrefix>
          <PlusIcon size={14} />
        </S.AtBranchExtensionPrefix>

        <S.AtBranchMoreThanLabel>
          {t("automation.atBranchExtension.moreThan")}
        </S.AtBranchMoreThanLabel>

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

        <S.AtBranchDaysLabel>
          {t("automation.atBranchExtension.days")}
        </S.AtBranchDaysLabel>

        <S.RemoveConditionButton
          type="button"
          aria-label={t("automation.atBranchExtension.removeAria")}
          onClick={onClear}
          data-qa="settings-automation-remove-at-branch-extension"
        >
          <XIcon size={16} />
        </S.RemoveConditionButton>
      </S.AtBranchExtensionRow>
    </>
  );
};
