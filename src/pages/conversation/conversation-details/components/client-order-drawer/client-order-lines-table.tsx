import { Flex } from "antd";
import { useTranslation } from "react-i18next";

import type { OrderDraftLine } from "@/features/orders/model/order.types";

import * as S from "./client-order-drawer.styled";
import { OrderProductLine } from "./order-product-line";

type ClientOrderLinesTableProps = {
  orderLines: OrderDraftLine[];
  onQuantityChange: (variantId: number, quantity: number) => void;
  onRemove: (variantId: number) => void;
};

export function ClientOrderLinesTable({
  orderLines,
  onQuantityChange,
  onRemove,
}: ClientOrderLinesTableProps) {
  const { t } = useTranslation();

  if (orderLines.length === 0) {
    return (
      <S.EmptyProductsState>
        {t("conversation.clientOrders.drawer.addedProductsEmpty")}
      </S.EmptyProductsState>
    );
  }

  return (
    <Flex vertical gap={8}>
      {orderLines.map((line) => (
        <OrderProductLine
          key={line.variantId}
          variant={line.variant}
          quantity={line.quantity}
          onQuantityChange={(quantity) =>
            onQuantityChange(line.variantId, quantity)
          }
          onRemove={() => onRemove(line.variantId)}
        />
      ))}
    </Flex>
  );
}
