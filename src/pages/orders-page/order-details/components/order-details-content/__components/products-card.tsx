import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Badge, Button, Card, Divider, Empty, Flex, Typography } from "antd";

import { formatMoney, formatText } from "../../../utils/order-details.utils";

import type { OrderEditMode } from "@/pages/orders-page/order-details/order-details.types";

import {
  getCompactProductMeta,
  getDiscountDisplayValue,
  getProductMeta,
} from "../utils/order-delivery-display.utils";
import * as S from "../order-details-content.styled";
import type { OrderDetails } from "@/features/orders/model/order.types";
import { resolveProductImageSrc } from "@/features/products/utils/product-display";
import type { TranslationFn } from "../order-details-content.types";

const { Text } = Typography;

type ProductsCardProps = {
  order: OrderDetails;
  t: TranslationFn;
  onEdit?: (mode: OrderEditMode) => void;
  productCardSize?: "small";
};

export const ProductsCard = ({
  order,
  t,
  onEdit,
  productCardSize,
}: ProductsCardProps) => {
  const discountDisplayValue = getDiscountDisplayValue(order.discountAmount);
  const canEditItems = order.status?.category === "new";
  const editDisabledReason = canEditItems
    ? undefined
    : t("orders.details.itemsEditLockedText");
  const isCompact = productCardSize === "small";

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
        onEdit ? (
          <Button
            className="no-print"
            disabled={!canEditItems}
            icon={<PencilSimpleIcon size={18} />}
            title={!canEditItems ? editDisabledReason : undefined}
            onClick={() => onEdit("items")}
          >
            {t("orders.details.edit")}
          </Button>
        ) : undefined
      }
    >
      {order.items.length ? (
        <Flex vertical>
          {order.items.map((item) => (
            <S.ProductRow key={item.id} $compact={isCompact}>
              <S.ProductImage
                shape="square"
                size={isCompact ? 36 : 64}
                src={resolveProductImageSrc(item.imageUrlSnapshot)}
              />

              <div style={{ minWidth: 0 }}>
                <Text
                  strong
                  style={{ display: "block", fontSize: isCompact ? 14 : 16 }}
                >
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
                  {isCompact
                    ? getCompactProductMeta(item)
                    : getProductMeta(item)}
                </Text>
              </div>

              {!isCompact && (
                <S.ProductPrice>
                  <Text type="secondary">
                    {item.quantity} x{" "}
                    {formatMoney(item.unitPriceAmount, order.currency)}
                  </Text>
                </S.ProductPrice>
              )}

              <S.ProductTotal strong={!isCompact} $compact={isCompact}>
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

      <Flex vertical gap={isCompact ? 6 : 12} style={{ paddingTop: 20 }}>
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
