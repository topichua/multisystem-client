import { PlusIcon, XIcon } from "@phosphor-icons/react";
import {
  Form,
  InputNumber,
  Select,
  type FormInstance,
  type FormListFieldData,
} from "antd";
import { useTranslation } from "react-i18next";

import type {
  AutomationConditionType,
  AutomationCriteria,
} from "@/features/automation/model/automation.types";

import type { AutomationConditionFormValue } from "./automation-rule-form.utils";
import {
  AT_BRANCH_SOURCE_STATUS,
  createEmptyCondition,
  isAtBranchCondition,
} from "./automation-rule-form.utils";
import * as S from "./settings-automation.styled";

type AutomationConditionsFieldsProps = {
  form: FormInstance;
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
  form: FormInstance;
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

  const sourceTypeOptions = [
    {
      value: "DELIVERY_STATUS",
      label: t("automation.sourceType.delivery"),
    },
    {
      value: "PAYMENT_STATUS",
      label: t("automation.sourceType.payment"),
    },
  ];

  const statusOptions =
    sourceType === "PAYMENT_STATUS"
      ? (criteria?.payment ?? [])
      : (criteria?.delivery ?? []);

  const showAtBranchExtensionUi =
    sourceType != null &&
    isAtBranchCondition({
      sourceType,
      sourceStatus,
    });
  const isAtBranchExtensionOpen =
    showAtBranchExtensionUi && durationValue != null;

  const clearExtension = () => {
    form.setFieldValue(["conditions", field.name, "durationValue"], null);
  };

  const openExtension = () => {
    form.setFieldValue(["conditions", field.name, "durationValue"], 3);
  };

  return (
    <S.ConditionBlock>
      {index > 0 ? (
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
      ) : null}

      <S.ConditionRow>
        <Form.Item
          name={[field.name, "sourceType"]}
          rules={[
            {
              required: true,
              message: t("automation.validation.sourceType"),
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Select
            options={sourceTypeOptions}
            onChange={() => {
              form.setFieldValue(
                ["conditions", field.name, "sourceStatus"],
                undefined,
              );
              clearExtension();
            }}
          />
        </Form.Item>

        <S.EqualsText>{t("automation.equals")}</S.EqualsText>

        <Form.Item
          name={[field.name, "sourceStatus"]}
          rules={[
            {
              required: true,
              message: t("automation.validation.sourceStatus"),
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Select
            placeholder={t("automation.placeholders.sourceStatus")}
            options={statusOptions.map((option) => ({
              value: option.id,
              label: option.name,
            }))}
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

      {showAtBranchExtensionUi && !isAtBranchExtensionOpen ? (
        <S.AtBranchExtensionCta
          type="button"
          data-qa="settings-automation-add-at-branch-extension"
          onClick={openExtension}
        >
          <PlusIcon size={16} />
          {t("automation.atBranchExtension.add")}
        </S.AtBranchExtensionCta>
      ) : null}

      {showAtBranchExtensionUi && isAtBranchExtensionOpen ? (
        <S.AtBranchExtensionRow>
          <S.AtBranchExtensionPrefix>
            <PlusIcon size={14} />
          </S.AtBranchExtensionPrefix>

          <S.AtBranchMoreThanLabel>
            {t("automation.atBranchExtension.moreThan")}
          </S.AtBranchMoreThanLabel>

          <Form.Item
            name={[field.name, "durationValue"]}
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
              data-qa="settings-automation-at-branch-days"
            />
          </Form.Item>

          <S.AtBranchDaysLabel>
            {t("automation.atBranchExtension.days")}
          </S.AtBranchDaysLabel>

          <S.RemoveConditionButton
            type="button"
            aria-label={t("automation.atBranchExtension.removeAria")}
            onClick={clearExtension}
            data-qa="settings-automation-remove-at-branch-extension"
          >
            <XIcon size={16} />
          </S.RemoveConditionButton>
        </S.AtBranchExtensionRow>
      ) : null}
    </S.ConditionBlock>
  );
};
