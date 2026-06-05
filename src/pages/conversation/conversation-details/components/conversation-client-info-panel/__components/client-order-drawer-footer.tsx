import { Button, Flex, Statistic } from "antd";
import { useTranslation } from "react-i18next";

type ClientOrderDrawerFooterProps = {
  createLoading: boolean;
  orderTotals: {
    productCount: number;
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

  return (
    <Flex gap={16} vertical>
      <Flex justify="space-between" align="center" gap={16}>
        <Statistic
          title={t("conversation.clientOrders.drawer.footerAmountOfProducts")}
          value={orderTotals.productCount}
        />
        <Statistic
          title={t("conversation.clientOrders.drawer.footerTotal")}
          value={orderTotals.total}
          suffix={orderTotals.currency}
          formatter={(value) => Number(value).toLocaleString("uk-UA")}
        />
      </Flex>
      <Flex gap={6} justify="flex-end">
        <Button onClick={onCancel}>
          {t("conversation.clientOrders.drawer.cancel")}
        </Button>
        <Button
          type="primary"
          disabled={placeOrderDisabled}
          loading={createLoading}
          onClick={onPlaceOrder}
        >
          {t("conversation.clientOrders.drawer.placeOrder")}
        </Button>
      </Flex>
    </Flex>
  );
}
