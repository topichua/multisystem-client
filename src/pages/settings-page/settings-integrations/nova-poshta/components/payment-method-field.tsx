import { Form, Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { NovaPoshtaPaymentMethod } from "@/features/integrations/model/integration.types";

type PaymentMethodFormValue = NovaPoshtaPaymentMethod | null;

export function PaymentMethodField() {
  const { t } = useTranslation();
  const paymentMethodOptions = useMemo(
    () => [
      {
        value: null,
        label: t("integrations.novaPoshtaWizard.paymentMethods.unset"),
      },
      {
        value: "cash",
        label: t("integrations.novaPoshtaWizard.paymentMethods.cash"),
      },
      {
        value: "non_cash",
        label: t("integrations.novaPoshtaWizard.paymentMethods.nonCash"),
      },
    ],
    [t],
  );

  return (
    <Form.Item
      label={t("integrations.novaPoshtaWizard.fields.paymentMethod.label")}
      name="payment_method"
    >
      <Select<PaymentMethodFormValue>
        options={paymentMethodOptions}
        placeholder={t(
          "integrations.novaPoshtaWizard.fields.paymentMethod.placeholder",
        )}
      />
    </Form.Item>
  );
}
