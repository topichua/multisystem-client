import { Form, Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { NovaPoshtaPayerType } from "@/features/integrations/model/integration.types";

export function PayerTypeField() {
  const { t } = useTranslation();
  const payerOptions = useMemo(
    () => [
      {
        value: "sender",
        label: t("integrations.novaPoshtaWizard.payerTypes.sender"),
      },
      {
        value: "recipient",
        label: t("integrations.novaPoshtaWizard.payerTypes.recipient"),
      },
    ],
    [t],
  );

  return (
    <Form.Item
      label={t("integrations.novaPoshtaWizard.fields.payerType.label")}
      name="payer_type"
      rules={[
        {
          required: true,
          message: t("integrations.novaPoshtaWizard.fields.payerType.required"),
        },
      ]}
    >
      <Select<NovaPoshtaPayerType>
        options={payerOptions}
        placeholder={t(
          "integrations.novaPoshtaWizard.fields.payerType.placeholder",
        )}
      />
    </Form.Item>
  );
}
