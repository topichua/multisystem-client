import { Col, Flex, Row } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { OrderEditMode } from "@/pages/orders-page/order-details/order-details.types";
import { OrderEditModal } from "@/pages/orders-page/order-details/components/order-edit-modal/order-edit-modal";

import { CustomerCard } from "./__components/customer-card";
import { DeliveryCard } from "./__components/delivery-card/delivery-card";
import { HistoryCard } from "./__components/history-card";
import { NotesCard } from "./__components/notes-card";
import { PaymentCard } from "./__components/payment-card/payment-card";
import { PrintDocumentHeader } from "./__components/print-document-header";
import { ProductsCard } from "./__components/products-card";
import type { OrderDetailsContentProps } from "./order-details-content.types";
import * as S from "./order-details-content.styled";
import { getCustomerName } from "../../utils/order-details.utils";

export const OrderDetailsContent = ({
  order,
  onCreateNovaPoshtaWaybill,
  onRemoveNovaPoshtaWaybill,
  onUpdateDelivery,
  onAttachDeliveryTracking,
  onUpdateOrder,
  onCreateManualPayment,
  onCreateOnlinePayment,
  onConfirmPaymentTransaction,
  onDeletePayment,
  onRefreshOrder,
}: OrderDetailsContentProps) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<OrderEditMode | null>(null);
  const customerName = getCustomerName(order.customer);

  return (
    <>
      <S.PrintStyles />
      <Row
        className="print-content"
        gutter={[24, 24]}
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          paddingBottom: 50,
        }}
      >
        <Col span={24}>
          <PrintDocumentHeader order={order} t={t} />
        </Col>

        <Col xs={24} lg={16}>
          <Flex vertical gap={24}>
            <CustomerCard order={order} customerName={customerName} t={t} />
            <ProductsCard order={order} t={t} onEdit={setEditMode} />
            <DeliveryCard
              order={order}
              t={t}
              onCreateNovaPoshtaWaybill={onCreateNovaPoshtaWaybill}
              onRemoveNovaPoshtaWaybill={onRemoveNovaPoshtaWaybill}
              onUpdateDelivery={onUpdateDelivery}
              onAttachDeliveryTracking={onAttachDeliveryTracking}
            />
          </Flex>
        </Col>

        <Col xs={24} lg={8}>
          <Flex vertical gap={24}>
            <PaymentCard
              order={order}
              t={t}
              onCreateManualPayment={onCreateManualPayment}
              onCreateOnlinePayment={onCreateOnlinePayment}
              onConfirmPaymentTransaction={onConfirmPaymentTransaction}
              onDeletePayment={onDeletePayment}
              onRefreshOrder={onRefreshOrder}
            />
            <NotesCard order={order} t={t} onEdit={setEditMode} />
            <HistoryCard order={order} t={t} />
          </Flex>
        </Col>
      </Row>

      {editMode && (
        <OrderEditModal
          order={order}
          open
          mode={editMode}
          onClose={() => setEditMode(null)}
          onUpdateOrder={onUpdateOrder}
        />
      )}
    </>
  );
};
