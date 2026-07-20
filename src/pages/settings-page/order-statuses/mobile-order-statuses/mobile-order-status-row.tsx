import { CaretRightIcon } from "@phosphor-icons/react";

import type { OrderStatus } from "@/features/orders/model/order.types";

import { OrderStatusSystemBadge } from "../order-status-system-badge";

import * as S from "./mobile-order-statuses-list-page.styled";

type MobileOrderStatusRowProps = {
  status: OrderStatus;
  onOpen: (statusId: number) => void;
};

export const MobileOrderStatusRow = ({
  status,
  onOpen,
}: MobileOrderStatusRowProps) => {
  return (
    <S.StatusRow
      role="listitem"
      data-qa={`orders-mobile-status-item-${status.id}`}
    >
      <S.StatusItemButton type="text" block onClick={() => onOpen(status.id)}>
        <S.ItemContent align="center" gap={12}>
          <S.ColorDot $color={status.color} aria-hidden="true" />
          <S.ItemCopy align="center" gap={8}>
            <S.ItemTitle>{status.name}</S.ItemTitle>
            {status.isSystem && <OrderStatusSystemBadge />}
          </S.ItemCopy>
          <S.Caret aria-hidden="true">
            <CaretRightIcon size={18} />
          </S.Caret>
        </S.ItemContent>
      </S.StatusItemButton>
    </S.StatusRow>
  );
};
