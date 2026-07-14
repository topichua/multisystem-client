import { Form, Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { NovaPoshtaPayerType } from "@/features/integrations/model/integration.types";

export function CodCommissionPayerField() {
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
      label={t("integrations.novaPoshtaWizard.fields.codCommissionPayer.label")}
      name="cod_commission_payer"
    >
      <Select<NovaPoshtaPayerType>
        allowClear
        options={payerOptions}
        placeholder={t(
          "integrations.novaPoshtaWizard.fields.codCommissionPayer.placeholder",
        )}
      />
    </Form.Item>
  );
}
