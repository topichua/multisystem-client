import { CreditCardIcon } from "@phosphor-icons/react";
import { Col, Form, Input, Row } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "../../settings-integrations.styled";
import { CodCommissionPayerField } from "./cod-commission-payer-field";
import { DeliveryTypeField } from "./delivery-type-field";
import { EstimatedDeliveryPriceField } from "./estimated-delivery-price-field";
import { PaymentMethodField } from "./payment-method-field";
import { PayerTypeField } from "./payer-type-field";

type DeliveryDefaultsFieldsProps = {
  columnBreakpoint?: "sm" | "md";
};

export function DeliveryDefaultsFields({
  columnBreakpoint = "sm",
}: DeliveryDefaultsFieldsProps) {
  const { t } = useTranslation();
  const columnProps =
    columnBreakpoint === "md" ? { md: 12 as const } : { sm: 12 as const };

  return (
    <S.NovaPoshtaFormSection>
      <S.NovaPoshtaSectionTitle>
        <CreditCardIcon size={16} />
        <span>
          {t("integrations.novaPoshtaWizard.sections.deliveryDefaults")}
        </span>
      </S.NovaPoshtaSectionTitle>

      <Row gutter={12}>
        <Col xs={24} {...columnProps}>
          <PayerTypeField />
        </Col>
        <Col xs={24} {...columnProps}>
          <CodCommissionPayerField />
        </Col>
      </Row>

      <Row gutter={12}>
        <Col xs={24} {...columnProps}>
          <PaymentMethodField />
        </Col>
        <Col xs={24} {...columnProps}>
          <DeliveryTypeField />
        </Col>
      </Row>

      <Form.Item
        label={t("integrations.novaPoshtaWizard.fields.paymentPurpose.label")}
        name="payment_purpose"
      >
        <Input
          placeholder={t(
            "integrations.novaPoshtaWizard.fields.paymentPurpose.placeholder",
          )}
        />
      </Form.Item>

      <EstimatedDeliveryPriceField columnBreakpoint={columnBreakpoint} />
    </S.NovaPoshtaFormSection>
  );
}
