import { Flex } from "antd";

import { ProductInventoryMovementHistoryItem } from "./product-inventory-movement-history-item";
import type { MovementWithQuantityTransition } from "./product-inventory-movements-history.utils";

type ProductInventoryMovementsListProps = {
  movementTransitions: MovementWithQuantityTransition[];
  currency: string;
  userNameByUserId: Map<number, string>;
};

export const ProductInventoryMovementsList = ({
  movementTransitions,
  currency,
  userNameByUserId,
}: ProductInventoryMovementsListProps) => (
  <Flex vertical gap={10}>
    {movementTransitions.map(({ movement, quantityBefore, quantityAfter }) => (
      <ProductInventoryMovementHistoryItem
        key={movement.id}
        movement={movement}
        quantityBefore={quantityBefore}
        quantityAfter={quantityAfter}
        currency={currency}
        userName={
          movement.user
            ? (userNameByUserId.get(movement.user.id) ??
              movement.user.name ??
              null)
            : null
        }
      />
    ))}
  </Flex>
);
