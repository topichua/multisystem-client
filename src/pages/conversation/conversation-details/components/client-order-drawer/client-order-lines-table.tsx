import { Empty, Flex } from "antd";
import { useTranslation } from "react-i18next";

import type { OrderDraftLine } from "@/features/orders/model/order.types";

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
      <Empty
        description={t("conversation.clientOrders.drawer.addedProductsEmpty")}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Flex vertical gap={12}>
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
