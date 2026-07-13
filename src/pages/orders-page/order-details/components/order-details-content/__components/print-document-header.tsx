import {
  formatDate,
  getOrderSourceLabel,
} from "../../../utils/order-details.utils";

import type { OrderSectionProps } from "../order-details-content.types";
import * as S from "../order-details-content.styled";

export const PrintDocumentHeader = ({ order, t }: OrderSectionProps) => (
  <S.PrintDocumentHeader className="print-only">
    <S.PrintDocumentTitle level={2}>
      {t("orders.orderTitle")} #{order.id}
    </S.PrintDocumentTitle>

    <S.PrintDocumentMeta>
      {order.status ? (
        <span>
          {t("orders.table.status")}: {order.status.name}
        </span>
      ) : null}
      <span>
        {t("orders.createdAt")} {formatDate(order.createdAt)}
      </span>
      <span>{getOrderSourceLabel(t, order.source)}</span>
    </S.PrintDocumentMeta>
  </S.PrintDocumentHeader>
);
