import { Form, Select } from "antd";
import { useTranslation } from "react-i18next";

import type { SenderOption } from "../types";

type SenderSelectFieldProps = {
  loading?: boolean;
  options: SenderOption[];
  onChange?: (
    value: string,
    option?: SenderOption | SenderOption[],
  ) => void;
};

export function SenderSelectField({
  loading = false,
  options,
  onChange,
}: SenderSelectFieldProps) {
  const { t } = useTranslation();

  return (
    <Form.Item
      label={t("integrations.novaPoshtaWizard.fields.sender.label")}
      name="sender_contact_ref"
      rules={[
        {
          required: true,
          message: t("integrations.novaPoshtaWizard.fields.sender.required"),
        },
      ]}
    >
      <Select<string, SenderOption>
        loading={loading}
        options={options}
        placeholder={t(
          "integrations.novaPoshtaWizard.fields.sender.placeholder",
        )}
        onChange={onChange}
      />
    </Form.Item>
  );
}
