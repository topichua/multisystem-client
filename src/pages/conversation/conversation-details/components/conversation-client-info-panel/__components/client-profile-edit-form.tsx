import { Col, Form, Input, Row } from "antd";
import type { FormInstance } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { phoneFieldRules } from "@/utils/phone-input";

export const CONVERSATION_CLIENT_EDIT_FORM_ID = "conversation-client-edit-form";

export type ClientProfileEditFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
};

type ClientProfileEditFormProps = {
  form: FormInstance<ClientProfileEditFormValues>;
  onFinish: (values: ClientProfileEditFormValues) => void;
};

export function ClientProfileEditForm({
  form,
  onFinish,
}: ClientProfileEditFormProps) {
  const { t } = useTranslation();
  const phoneRules = useMemo(
    () =>
      phoneFieldRules({
        required: true,
        requiredMessage: t("clients.required"),
        invalidMessage: t("clients.phoneInvalid"),
      }),
    [t],
  );

  return (
    <Form
      id={CONVERSATION_CLIENT_EDIT_FORM_ID}
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="first_name"
            label={t("clients.firstName")}
            rules={[{ required: true, message: t("clients.required") }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="last_name"
            label={t("clients.lastName")}
            rules={[{ required: true, message: t("clients.required") }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="phone" label={t("clients.phone")} rules={phoneRules}>
        <ClientPhoneFormInput
          autoComplete="tel"
          placeholder={t("clients.phonePlaceholder")}
        />
      </Form.Item>
    </Form>
  );
}
