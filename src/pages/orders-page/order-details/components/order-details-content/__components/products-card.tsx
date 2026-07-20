import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Badge, Button, Card, Divider, Empty, Flex, Typography } from "antd";

import { formatMoney, formatText } from "../../../utils/order-details.utils";

import type { EditableSectionProps } from "../order-details-content.types";
import {
  getDiscountDisplayValue,
  getProductMeta,
} from "../utils/order-delivery-display.utils";
import * as S from "../order-details-content.styled";

const { Text } = Typography;

export const ProductsCard = ({ order, t, onEdit }: EditableSectionProps) => {
  const discountDisplayValue = getDiscountDisplayValue(order.discountAmount);
  const canEditItems = order.status?.category === "new";
  const editDisabledReason = canEditItems
    ? undefined
    : t("orders.details.itemsEditLockedText");

  return (
    <Card
      className="print-card"
      title={
        <Flex align="center" gap={10}>
          <span>{t("orders.productsTab")}</span>
          <Badge count={order.items.length} showZero />
        </Flex>
      }
      extra={
        <Button
          className="no-print"
          disabled={!canEditItems}
          icon={<PencilSimpleIcon size={18} />}
          title={!canEditItems ? editDisabledReason : undefined}
          onClick={() => onEdit("items")}
        >
          {t("orders.details.edit")}
        </Button>
      }
    >
      {order.items.length ? (
        <Flex vertical>
          {order.items.map((item) => (
            <S.ProductRow key={item.id}>
              <S.ProductImage
                shape="square"
                size={64}
                src={item.imageUrlSnapshot ?? undefined}
              >
                {formatText(item.productTitleSnapshot).slice(0, 1)}
              </S.ProductImage>

              <div style={{ minWidth: 0 }}>
                <Text strong style={{ display: "block", fontSize: 16 }}>
                  {formatText(item.productTitleSnapshot)}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getProductMeta(item)}
                </Text>
              </div>

              <S.ProductPrice>
                <Text type="secondary">
                  {item.quantity} x{" "}
                  {formatMoney(item.unitPriceAmount, order.currency)}
                </Text>
              </S.ProductPrice>

              <S.ProductTotal strong>
                {formatMoney(item.totalPriceAmount, order.currency)}
              </S.ProductTotal>
            </S.ProductRow>
          ))}
        </Flex>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.productsTab")}
        />
      )}

      <Flex vertical gap={12} style={{ paddingTop: 20 }}>
        <Flex justify="space-between" gap={16}>
          <Text type="secondary">{t("orders.subtotal")}</Text>
          <Text>{formatMoney(order.subtotalAmount, order.currency)}</Text>
        </Flex>

        <Flex justify="space-between" gap={16}>
          <Text type="secondary">{t("orders.deliveryAmount")}</Text>
          <Text>{formatMoney(order.deliveryAmount, order.currency)}</Text>
        </Flex>

        <Flex justify="space-between" gap={16}>
          <Text type="success">{t("orders.discount")}</Text>
          <Text type="success" strong>
            {formatMoney(discountDisplayValue, order.currency)}
          </Text>
        </Flex>

        <Divider style={{ margin: "8px 0 0" }} />

        <Flex justify="space-between" gap={16} align="center">
          <Text strong style={{ fontSize: 16 }}>
            {t("orders.total")}
          </Text>
          <Text strong style={{ fontSize: 22 }}>
            {formatMoney(order.totalAmount, order.currency)}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};
