import { ArrowLeftIcon, PrinterIcon, TagIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { OrderStatusSelect } from "@/features/orders/components/order-status-select";
import type { OrderDetails } from "@/features/orders/model/order.types";

import * as S from "./order-details-header.styled";
import { formatDate, getOrderSourceLabel } from "../utils/order-details.utils";

type OrderDetailsHeaderProps = {
  order: OrderDetails | null;
  orderId: number | null;
  onBack: () => void;
  onPrint: () => void;
  onStatusChangeSuccess: (nextStatusId: number) => void;
};

export const OrderDetailsHeader = ({
  order,
  orderId,
  onBack,
  onPrint,
  onStatusChangeSuccess,
}: OrderDetailsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Header data-qa="layout-order-details-header">
      <S.HeaderRoot>
        <S.LeftCluster>
          <S.BackButton
            aria-label={t("orders.backToOrders")}
            className="no-print"
            icon={<ArrowLeftIcon size={24} />}
            onClick={onBack}
          />

          <S.TitleBlock>
            <S.TitleRow>
              <S.Title level={3}>
                {t("orders.orderTitle")}{" "}
                {(order?.id ?? orderId) ? `#${order?.id ?? orderId}` : ""}
              </S.Title>

              {order?.status ? (
                <S.StatusBadge $color={order.status.color}>
                  <S.StatusDot />
                  {order.status.name}
                </S.StatusBadge>
              ) : null}
            </S.TitleRow>

            {order ? (
              <S.MetaLine>
                <S.MetaItem>
                  <TagIcon size={18} />
                  {getOrderSourceLabel(t, order.source)}
                </S.MetaItem>

                <S.MetaSeparator>·</S.MetaSeparator>

                <S.MetaItem>
                  {t("orders.createdAt")} {formatDate(order.createdAt)}
                </S.MetaItem>

                <S.MetaSeparator>·</S.MetaSeparator>

                <S.MetaItem>
                  {t("orders.updatedAt")} {formatDate(order.updatedAt)}
                </S.MetaItem>
              </S.MetaLine>
            ) : null}
          </S.TitleBlock>
        </S.LeftCluster>

        {order ? (
          <S.Actions className="no-print">
            <S.PrintButton
              className="no-print"
              icon={<PrinterIcon size={20} />}
              onClick={onPrint}
            >
              {t("orders.print")}
            </S.PrintButton>

            <S.StatusSelectSlot>
              <OrderStatusSelect
                orderId={order.id}
                statusId={order.statusId}
                variant="outlined"
                style={{ width: "100%" }}
                onChangeSuccess={onStatusChangeSuccess}
              />
            </S.StatusSelectSlot>
          </S.Actions>
        ) : null}
      </S.HeaderRoot>
    </PaneDetailLayout.Header>
  );
};
