import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getOrderDetailsPath } from "@/app/router/pages-map";
import { Tag } from "@/components/tag/tag";
import { OrderStatusSelect } from "@/features/orders/components/order-status-select";
import type { OrderListItem } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { formatDate } from "@/utils/date-time";

import { formatOrderCustomerName } from "../order-list-display.utils";
import * as S from "./mobile-orders-list-page.styled";

const CARD_NAVIGATION_BLOCKER_SELECTOR =
  "a,button,input,select,textarea,[role='button'],[role='combobox'],.ant-select,.rc-select,.ant-select-selector,.ant-select-dropdown,.ant-dropdown,.ant-popover,[data-qa^='orders-mobile-status']";

type MobileOrderCardProps = {
  order: OrderListItem;
};

export const MobileOrderCard = ({ order }: MobileOrderCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customerName = formatOrderCustomerName(order);
  const internalNote = order.internalNote?.trim();

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest(CARD_NAVIGATION_BLOCKER_SELECTOR)) {
      return;
    }

    navigate(getOrderDetailsPath(order.id));
  };

  return (
    <S.OrderCard
      data-qa={`orders-mobile-card-${order.id}`}
      data-qa-open={`orders-mobile-open-${order.id}`}
      onClick={handleCardClick}
    >
      <S.CardBody>
        <S.TopRow justify="space-between" align="center" gap={8}>
          <S.OrderNumber>#{order.id}</S.OrderNumber>
          <S.CreatedDate>{formatDate(order.createdAt)}</S.CreatedDate>
        </S.TopRow>
        <S.CustomerName>{customerName}</S.CustomerName>
        <S.MetaRow justify="space-between" align="center" gap={8}>
          <Tag color="blue">
            {t(`orders.sources.${order.source}`, {
              defaultValue: order.source,
            })}
          </Tag>
          <S.TotalAmount>
            {formatMoney(order.totalAmount, order.currency)}
          </S.TotalAmount>
        </S.MetaRow>

        <S.StatusSection>
          <S.FieldLabel>{t("orders.table.status")}</S.FieldLabel>
          <S.StatusControl
            data-qa={`orders-mobile-status-${order.id}`}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <OrderStatusSelect
              variant="outlined"
              orderId={order.id}
              statusId={order.statusId}
              dataQa={`orders-mobile-status-select-${order.id}`}
              style={{ width: "100%", minWidth: 0 }}
            />
          </S.StatusControl>
        </S.StatusSection>

        {internalNote ? (
          <S.NoteSection>
            <S.FieldLabel>{t("orders.table.internalNote")}</S.FieldLabel>
            <S.InternalNote>{internalNote}</S.InternalNote>
          </S.NoteSection>
        ) : null}
      </S.CardBody>
    </S.OrderCard>
  );
};
