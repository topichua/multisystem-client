import { Form, Segmented } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type SenderTypeFieldLabel = "senderType" | "senderPlace";

type SenderTypeFieldProps = {
  label?: SenderTypeFieldLabel;
  onChange: (value: string | number) => void;
};

export function SenderTypeField({
  label = "senderType",
  onChange,
}: SenderTypeFieldProps) {
  const { t } = useTranslation();
  const senderTypeOptions = useMemo(
    () => [
      {
        value: "warehouse",
        label: t("integrations.novaPoshtaWizard.senderTypes.warehouse"),
      },
      {
        value: "address",
        label: t("integrations.novaPoshtaWizard.senderTypes.address"),
      },
    ],
    [t],
  );
  const labelText =
    label === "senderPlace"
      ? t("integrations.novaPoshtaDetails.fields.senderPlace")
      : t("integrations.novaPoshtaWizard.fields.senderType.label");

  return (
    <Form.Item label={labelText} name="sender_type">
      <Segmented block options={senderTypeOptions} onChange={onChange} />
    </Form.Item>
  );
}
