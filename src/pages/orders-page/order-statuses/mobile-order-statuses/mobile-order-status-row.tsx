import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CaretRightIcon, DotsSixVerticalIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import type { OrderStatus } from "@/features/orders/model/order.types";

import * as S from "./mobile-order-statuses-list-page.styled";

type MobileOrderStatusRowProps = {
  status: OrderStatus;
  reorderDisabled: boolean;
  onOpen: (statusId: number) => void;
};

export const MobileOrderStatusRow = ({
  status,
  reorderDisabled,
  onOpen,
}: MobileOrderStatusRowProps) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: status.id,
    disabled: reorderDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <S.StatusRow
      ref={setNodeRef}
      style={style}
      role="listitem"
      $isDragging={isDragging}
      data-qa={`orders-mobile-status-item-${status.id}`}
    >
      <S.DragHandle
        type="button"
        aria-label={t("orderStatuses.dragHandleAria")}
        disabled={reorderDisabled}
        data-qa={`orders-mobile-status-drag-handle-${status.id}`}
        {...attributes}
        {...listeners}
      >
        <DotsSixVerticalIcon size={18} aria-hidden />
      </S.DragHandle>
      <S.StatusItemButton type="text" block onClick={() => onOpen(status.id)}>
        <S.ItemContent align="center" gap={12}>
          <S.ColorDot $color={status.color} aria-hidden="true" />
          <S.ItemCopy align="center" gap={8}>
            <S.ItemTitle>{status.name}</S.ItemTitle>
            {status.isDefault ? (
              <S.DefaultBadge>{t("orderStatuses.defaultLabel")}</S.DefaultBadge>
            ) : null}
          </S.ItemCopy>
          <S.Caret aria-hidden="true">
            <CaretRightIcon size={18} />
          </S.Caret>
        </S.ItemContent>
      </S.StatusItemButton>
    </S.StatusRow>
  );
};
