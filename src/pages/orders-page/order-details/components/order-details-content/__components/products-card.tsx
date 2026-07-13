import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Button, Empty, Flex, Typography } from "antd";

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
  const statusAllowsItemEdit = order.status?.category === "new";
  const canEditItems = statusAllowsItemEdit;
  const editDisabledReason = statusAllowsItemEdit
    ? t("orders.details.editUnavailable")
    : t("orders.details.itemsEditLockedText");

  return (
    <S.DetailsCard className="print-card section-products">
      <S.CardHeader>
        <Flex align="center" gap={10} wrap>
          <S.CardTitle level={3}>{t("orders.productsTab")}</S.CardTitle>
          <S.CountBadge>{order.items.length}</S.CountBadge>
        </Flex>

        <Flex align="center" gap={8} wrap className="no-print">
          <Button
            disabled={!canEditItems}
            icon={<PencilSimpleIcon size={18} />}
            title={!canEditItems ? editDisabledReason : undefined}
            onClick={() => onEdit("items")}
          >
            {t("orders.details.edit")}
          </Button>
        </Flex>
      </S.CardHeader>

      {order.items.length ? (
        <S.ProductsList>
          {order.items.map((item) => (
            <S.ProductRow key={item.id}>
              <S.ProductImage
                shape="square"
                size={64}
                src={item.imageUrlSnapshot ?? undefined}
              >
                {formatText(item.productTitleSnapshot).slice(0, 1)}
              </S.ProductImage>

              <S.ProductInfo>
                <S.ProductName>
                  {formatText(item.productTitleSnapshot)}
                </S.ProductName>
                <S.ProductMeta>{getProductMeta(item)}</S.ProductMeta>
              </S.ProductInfo>

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
        </S.ProductsList>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.productsTab")}
        />
      )}

      <S.TotalsList>
        <S.TotalRow>
          <Text type="secondary">{t("orders.subtotal")}</Text>
          <Text>{formatMoney(order.subtotalAmount, order.currency)}</Text>
        </S.TotalRow>

        <S.TotalRow>
          <Text type="secondary">{t("orders.deliveryAmount")}</Text>
          <Text>{formatMoney(order.deliveryAmount, order.currency)}</Text>
        </S.TotalRow>

        <S.TotalRow>
          <S.DiscountText>{t("orders.discount")}</S.DiscountText>
          <S.DiscountText strong>
            {formatMoney(discountDisplayValue, order.currency)}
          </S.DiscountText>
        </S.TotalRow>

        <S.GrandTotalRow>
          <S.GrandTotalLabel>{t("orders.total")}</S.GrandTotalLabel>
          <S.GrandTotalValue>
            {formatMoney(order.totalAmount, order.currency)}
          </S.GrandTotalValue>
        </S.GrandTotalRow>
      </S.TotalsList>
    </S.DetailsCard>
  );
};
