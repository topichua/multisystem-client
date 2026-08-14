import { Form, Input, Select } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_MESSAGE_TEMPLATE_TYPE,
  MESSAGE_TEMPLATE_TYPES,
  type MessageTemplateType,
  type MessageTemplateWritePayload,
} from "@/features/message-templates/model/message-template.types";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";

import { getTemplateCharacterCount } from "./settings-templates.utils";
import { TemplateActiveToggle } from "./template-active-toggle";
import {
  TemplateBodyField,
  type TemplateBodyFieldHandle,
} from "./template-body-field";
import { TemplateVariablesPicker } from "./template-variables-picker";

export type TemplateFormValues = {
  name: string;
  type: MessageTemplateType;
  template: string;
  isActive: boolean;
};

export const DEFAULT_TEMPLATE_FORM_VALUES: TemplateFormValues = {
  name: "",
  type: DEFAULT_MESSAGE_TEMPLATE_TYPE,
  template: "",
  isActive: true,
};

export function toTemplateWritePayload(
  values: TemplateFormValues,
): MessageTemplateWritePayload {
  return {
    type: values.type,
    name: values.name.trim(),
    template: values.template ?? "",
    isActive: values.isActive,
  };
}

type TemplateFormFieldsProps = {
  bodyRows?: number;
  bodyDataQa?: string;
  autoFocusName?: boolean;
};

export const TemplateFormFields = observer(
  ({
    bodyRows = 6,
    bodyDataQa,
    autoFocusName = false,
  }: TemplateFormFieldsProps) => {
    const { t } = useTranslation();
    const store = useMessageTemplatesStore();
    const form = Form.useFormInstance<TemplateFormValues>();
    const bodyRef = useRef<TemplateBodyFieldHandle>(null);
    const templateBody = Form.useWatch("template", form) ?? "";
    const selectedType =
      Form.useWatch("type", form) ?? DEFAULT_MESSAGE_TEMPLATE_TYPE;
    const variables = store.getVariablesForType(selectedType);
    const requiredRule = [{ required: true, message: t("templates.required") }];

    const typeOptions = useMemo(
      () =>
        MESSAGE_TEMPLATE_TYPES.map((type) => ({
          value: type,
          label: t(`templates.typeOptions.${type}`),
        })),
      [t],
    );

    return (
      <>
        <Form.Item
          name="isActive"
          valuePropName="checked"
          style={{ marginBottom: 16 }}
        >
          <TemplateActiveToggle />
        </Form.Item>
        <Form.Item name="name" label={t("templates.name")} rules={requiredRule}>
          <Input autoFocus={autoFocusName} />
        </Form.Item>
        <Form.Item name="type" label={t("templates.type")} rules={requiredRule}>
          <Select options={typeOptions} data-qa="template-type-select" />
        </Form.Item>
        <Form.Item
          name="template"
          label={t("templates.body")}
          rules={requiredRule}
          extra={t("templates.bodyHint", {
            count: getTemplateCharacterCount(templateBody),
          })}
        >
          <TemplateBodyField
            ref={bodyRef}
            rows={bodyRows}
            data-qa={bodyDataQa}
          />
        </Form.Item>
        <TemplateVariablesPicker
          variables={variables}
          onInsert={(placeholder) => bodyRef.current?.insertText(placeholder)}
        />
      </>
    );
  },
);
