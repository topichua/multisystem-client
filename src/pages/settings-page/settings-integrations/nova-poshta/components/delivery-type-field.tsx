import { Form, Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { NovaPoshtaDeliveryType } from "@/features/integrations/model/integration.types";

type DeliveryTypeFormValue = NovaPoshtaDeliveryType | null;

export function DeliveryTypeField() {
  const { t } = useTranslation();
  const deliveryTypeOptions = useMemo(
    () => [
      {
        value: null,
        label: t("integrations.novaPoshtaWizard.deliveryTypes.unset"),
      },
      {
        value: "cargo",
        label: t("integrations.novaPoshtaWizard.deliveryTypes.cargo"),
      },
      {
        value: "documents",
        label: t("integrations.novaPoshtaWizard.deliveryTypes.documents"),
      },
      {
        value: "tires_wheels",
        label: t("integrations.novaPoshtaWizard.deliveryTypes.tiresWheels"),
      },
      {
        value: "pallet",
        label: t("integrations.novaPoshtaWizard.deliveryTypes.pallet"),
      },
    ],
    [t],
  );

  return (
    <Form.Item
      label={t("integrations.novaPoshtaWizard.fields.deliveryType.label")}
      name="delivery_type"
    >
      <Select<DeliveryTypeFormValue>
        options={deliveryTypeOptions}
        placeholder={t(
          "integrations.novaPoshtaWizard.fields.deliveryType.placeholder",
        )}
      />
    </Form.Item>
  );
}
