import { CreditCardIcon } from "@phosphor-icons/react";
import { Form, Input, InputNumber, Segmented } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import type { OrderFormValues } from "@/features/orders/model/order.types";

import { drawerKey } from "../orders-new.constants";
import * as S from "../orders-new-page.styled";
import type { PaymentMethodValue } from "../orders-new.types";
import { SectionHeading } from "./section-heading";

type OrdersNewPaymentSectionProps = {
  deliveryForm: FormInstance<OrderFormValues>;
  onPaymentMethodChange: (value: PaymentMethodValue) => void;
  paymentMethodOptions: Array<{
    disabled?: boolean;
    label: string;
    value: PaymentMethodValue;
  }>;
  paymentMethodValue: PaymentMethodValue;
  withoutDelivery: boolean;
};

export function OrdersNewPaymentSection({
  deliveryForm,
  onPaymentMethodChange,
  paymentMethodOptions,
  paymentMethodValue,
  withoutDelivery,
}: OrdersNewPaymentSectionProps) {
  const { t } = useTranslation();

  return (
    <S.SectionCard>
      <S.CardHeader>
        <SectionHeading icon={<CreditCardIcon size={18} />}>
          {t("orders.create.payment.title")}
        </SectionHeading>
      </S.CardHeader>

      <S.PaymentFormPanel>
        <Form form={deliveryForm} layout="vertical">
          <Form.Item hidden name="isCashOnDelivery">
            <Input />
          </Form.Item>

          <Segmented<PaymentMethodValue>
            block
            value={paymentMethodValue}
            options={paymentMethodOptions}
            onChange={onPaymentMethodChange}
          />

          {paymentMethodValue === "cash_on_delivery" && !withoutDelivery ? (
            <Form.Item
              label={t(drawerKey("cashOnDeliveryAmountLabel"))}
              name="cashOnDeliveryAmount"
            >
              <InputNumber
                min={0}
                controls={false}
                addonAfter={t(drawerKey("uah"))}
                placeholder="0"
                style={{ width: "100%" }}
              />
            </Form.Item>
          ) : null}
        </Form>
      </S.PaymentFormPanel>
    </S.SectionCard>
  );
}
