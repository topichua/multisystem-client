import { TagIcon } from "@phosphor-icons/react";
import { Button, Divider, Form, InputNumber } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";

import type { OrderFormValues } from "@/features/orders/model/order.types";

import * as S from "./client-order-drawer.styled";

type ClientOrderDrawerFooterProps = {
  createLoading: boolean;
  form: FormInstance<OrderFormValues>;
  orderTotals: {
    productCount: number;
    productsTotal: number;
    deliveryAmount: number;
    discountAmount: number;
    discountPercent: number;
    hasCashOnDelivery: boolean;
    total: number;
    currency: string;
  };
  placeOrderDisabled: boolean;
  onCancel: () => void;
  onPlaceOrder: () => void;
};

export function ClientOrderDrawerFooter({
  createLoading,
  form,
  orderTotals,
  placeOrderDisabled,
  onCancel,
  onPlaceOrder,
}: ClientOrderDrawerFooterProps) {
  const { t } = useTranslation();
  const formatAmount = (amount: number) =>
    Number(amount).toLocaleString("uk-UA");
  const formattedProductsTotal = formatAmount(orderTotals.productsTotal);
  const formattedDeliveryAmount = formatAmount(orderTotals.deliveryAmount);
  const formattedDiscountAmount = formatAmount(orderTotals.discountAmount);
  const formattedTotal = formatAmount(orderTotals.total);

  return (
    <Form form={form} component={false}>
      <S.Footer>
        <S.FooterDiscount>
          <S.FooterDiscountLabel>
            <TagIcon size={16} aria-hidden="true" />
            {t("conversation.clientOrders.drawer.footerOrderDiscount")}
          </S.FooterDiscountLabel>
          <S.FooterDiscountInput>
            <Form.Item name="discountPercent" noStyle>
              <InputNumber
                min={0}
                max={100}
                precision={0}
                controls={false}
                addonAfter="%"
              />
            </Form.Item>
          </S.FooterDiscountInput>
        </S.FooterDiscount>

        <S.FooterSummary>
          <S.SummaryRow>
            <span>
              {t("conversation.clientOrders.drawer.sectionProducts")} (
              {orderTotals.productCount})
            </span>
            <span>
              {formattedProductsTotal} {orderTotals.currency}
            </span>
          </S.SummaryRow>
          {orderTotals.discountPercent > 0 && (
            <S.SummaryDiscount>
              <span>
                {t("conversation.clientOrders.drawer.footerDiscount", {
                  percent: orderTotals.discountPercent,
                })}
              </span>
              <span>
                -{formattedDiscountAmount} {orderTotals.currency}
              </span>
            </S.SummaryDiscount>
          )}
          {orderTotals.hasCashOnDelivery && (
            <S.SummaryRow>
              <span>
                {t("conversation.clientOrders.drawer.footerDelivery")}
              </span>
              <span>
                {formattedDeliveryAmount} {orderTotals.currency}
              </span>
            </S.SummaryRow>
          )}
          <Divider style={{ margin: 0 }} />
          <S.SummaryTotal>
            <span>{t("conversation.clientOrders.drawer.footerTotal")}</span>
            <span>
              {formattedTotal} {orderTotals.currency}
            </span>
          </S.SummaryTotal>
        </S.FooterSummary>
        <S.FooterActions>
          <Button onClick={onCancel}>
            {t("conversation.clientOrders.drawer.cancel")}
          </Button>
          <Button
            type="primary"
            disabled={placeOrderDisabled}
            loading={createLoading}
            onClick={onPlaceOrder}
          >
            {t("conversation.clientOrders.createOrder")}
          </Button>
        </S.FooterActions>
      </S.Footer>
    </Form>
  );
}
