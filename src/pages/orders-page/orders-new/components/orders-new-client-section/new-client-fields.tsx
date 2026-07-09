import { Form, Input } from "antd";
import type { Rule } from "antd/es/form";
import { useTranslation } from "react-i18next";

import { ClientPhoneFormInput } from "@/components/client-phone-form-input";

import * as S from "../../orders-new-page.styled";

type NewClientFieldsProps = {
  phoneRules: Rule[];
};

export function NewClientFields({ phoneRules }: NewClientFieldsProps) {
  const { t } = useTranslation();

  const requiredRule: Rule = {
    required: true,
    message: t("orders.create.client.required"),
  };

  return (
    <S.ClientFields>
      <Form.Item
        label={t("orders.create.client.firstNameLabel")}
        name="clientFirstName"
        rules={[requiredRule]}
      >
        <Input
          placeholder={t("orders.create.client.firstNamePlaceholder")}
          autoComplete="given-name"
        />
      </Form.Item>

      <Form.Item
        label={t("orders.create.client.lastNameLabel")}
        name="clientLastName"
        rules={[requiredRule]}
      >
        <Input
          placeholder={t("orders.create.client.lastNamePlaceholder")}
          autoComplete="family-name"
        />
      </Form.Item>

      <Form.Item
        label={t("orders.create.client.phoneLabel")}
        name="clientPhone"
        rules={phoneRules}
      >
        <ClientPhoneFormInput
          placeholder={t("orders.create.client.phonePlaceholder")}
          autoComplete="tel"
        />
      </Form.Item>
    </S.ClientFields>
  );
}
