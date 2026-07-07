import { Button, Divider } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "./client-order-drawer.styled";

type ClientOrderDrawerFooterProps = {
  createLoading: boolean;
  orderTotals: {
    productCount: number;
    productsTotal: number;
    deliveryAmount: number;
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
  const formattedTotal = formatAmount(orderTotals.total);

  return (
    <S.Footer>
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
        {orderTotals.hasCashOnDelivery ? (
          <S.SummaryRow>
            <span>{t("conversation.clientOrders.drawer.footerDelivery")}</span>
            <span>
              {formattedDeliveryAmount} {orderTotals.currency}
            </span>
          </S.SummaryRow>
        ) : null}
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
  );
}
