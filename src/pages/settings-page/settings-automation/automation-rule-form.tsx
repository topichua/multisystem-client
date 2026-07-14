import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import type { AutomationCriteria } from "@/features/automation/model/automation.types";
import { FormCard } from "@/components/layout/form-card.styled";

import { AutomationConditionsFields } from "./automation-conditions-fields";
import type { AutomationRuleFormValues } from "./automation-rule-form.utils";
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
  );
};
