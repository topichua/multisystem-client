import { CheckIcon } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Divider,
  Flex,
  InputNumber,
  Select,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";

import type { OrderSource } from "@/features/orders/model/order-list.constants";

import { SUMMARY_CURRENCY } from "../orders-new.constants";
import * as S from "../orders-new-page.styled";
import { formatProductAmount } from "../orders-new.utils.tsx";

const { Text, Title } = Typography;

type OrdersNewSummaryAsideProps = {
  mobile?: boolean;
  canCreateOrder: boolean;
  createLoading: boolean;
  onCreateOrder: () => void;
  onOrderDiscountChange: (value: number | null) => void;
  onOrderSourceChange: (source: OrderSource) => void;
  orderDiscountPercent: number;
  orderLinesCount: number;
  orderPositionDiscountTotal: number;
  orderProductsSubtotal: number;
  orderSource: OrderSource;
  orderSourceOptions: Array<{ label: string; value: OrderSource }>;
  orderSummaryDeliveryAmount: number;
  orderSummaryTotal: number;
};

export function OrdersNewSummaryAside({
  mobile = false,
  canCreateOrder,
  createLoading,
  onCreateOrder,
  onOrderDiscountChange,
  onOrderSourceChange,
  orderDiscountPercent,
  orderLinesCount,
  orderPositionDiscountTotal,
  orderProductsSubtotal,
  orderSource,
  orderSourceOptions,
  orderSummaryDeliveryAmount,
  orderSummaryTotal,
}: OrdersNewSummaryAsideProps) {
  const { t } = useTranslation();

  const AsideWrapper = mobile ? S.MobileSummaryAside : S.SummaryAside;

  return (
    <AsideWrapper data-qa={mobile ? "orders-mobile-new-summary" : undefined}>
      <S.SummaryCard>
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
          {t("orders.create.summary.title")}
        </Title>

        <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
          {t("orders.create.summary.source")}
        </Text>
        <Select<OrderSource>
          value={orderSource}
          options={orderSourceOptions}
          onChange={onOrderSourceChange}
        />

        <Divider style={{ margin: "16px 0" }} />

        <Flex vertical gap={12}>
          <Flex justify="space-between" align="center" gap={12}>
            <Text>
              {t("orders.create.summary.products", {
                count: orderLinesCount,
              })}
            </Text>
            <Text strong>
              {formatProductAmount(orderProductsSubtotal, SUMMARY_CURRENCY)}
            </Text>
          </Flex>

          {orderPositionDiscountTotal > 0 && (
            <Flex justify="space-between" align="center" gap={12}>
              <Text>{t("orders.create.summary.positionDiscounts")}</Text>
              <Text strong>
                -
                {formatProductAmount(
                  orderPositionDiscountTotal,
                  SUMMARY_CURRENCY,
                )}
              </Text>
            </Flex>
          )}

          <Flex justify="space-between" align="center" gap={12}>
            <Text>{t("orders.create.summary.delivery")}</Text>
            <Text strong>
              {orderSummaryDeliveryAmount > 0
                ? formatProductAmount(
                    orderSummaryDeliveryAmount,
                    SUMMARY_CURRENCY,
                  )
                : "—"}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" gap={12}>
            <Text>{t("orders.create.summary.orderDiscount")}</Text>
            <InputNumber
              min={0}
              max={99}
              precision={0}
              controls={false}
              addonAfter="%"
              value={orderDiscountPercent}
              style={{ width: 80 }}
              onChange={onOrderDiscountChange}
            />
          </Flex>
        </Flex>

        <Divider style={{ margin: "16px 0" }} />

        <Flex justify="space-between" align="center" gap={12}>
          <Text strong>{t("orders.create.summary.total")}</Text>
          <Title level={4} style={{ margin: 0 }}>
            {formatProductAmount(orderSummaryTotal, SUMMARY_CURRENCY)}
          </Title>
        </Flex>

        <S.SummaryStatusNote align="center" gap={8}>
          <Badge status="processing" />
          <Text type="secondary">{t("orders.create.summary.statusNote")}</Text>
        </S.SummaryStatusNote>

        <Button
          type="primary"
          block
          size={mobile ? "large" : "middle"}
          icon={<CheckIcon size={16} />}
          disabled={!canCreateOrder}
          loading={createLoading}
          style={{ marginTop: 14 }}
          data-qa={mobile ? "orders-mobile-new-create" : undefined}
          onClick={onCreateOrder}
        >
          {t("orders.create.summary.create")}
        </Button>

        <Text
          type="secondary"
          style={{
            display: "block",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {t("orders.create.summary.hint")}
        </Text>
      </S.SummaryCard>
    </AsideWrapper>
  );
}
