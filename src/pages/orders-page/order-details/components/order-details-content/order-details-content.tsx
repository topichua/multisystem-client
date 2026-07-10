import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { OrderEditMode } from "@/pages/orders-page/order-details/order-details.types";
import { OrderEditModal } from "@/pages/orders-page/order-details/components/order-edit-modal/order-edit-modal";

import { CustomerCard } from "./__components/customer-card";
import { DeliveryCard } from "./__components/delivery-card";
import { HistoryCard } from "./__components/history-card";
import { NotesCard } from "./__components/notes-card";
import { PaymentCard } from "./__components/payment-card";
import { PrintDocumentHeader } from "./__components/print-document-header";
import { ProductsCard } from "./__components/products-card";
import type { OrderDetailsContentProps } from "./order-details-content.types";
import * as S from "./order-details-content.styled";
import { getCustomerName } from "../../utils/order-details.utils";

export const OrderDetailsContent = ({
  order,
  onCreateNovaPoshtaWaybill,
  onRemoveNovaPoshtaWaybill,
  onUpdateOrder,
}: OrderDetailsContentProps) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<OrderEditMode | null>(null);
  const customerName = getCustomerName(order.customer);

  return (
    <>
      <S.PrintStyles />

      <S.LayoutRoot className="print-content">
        <PrintDocumentHeader order={order} t={t} />

        <S.MainColumn>
          <ProductsCard order={order} t={t} onEdit={setEditMode} />
          <HistoryCard order={order} t={t} />
        </S.MainColumn>

        <S.SideColumn>
          <CustomerCard order={order} customerName={customerName} t={t} />
          <NotesCard order={order} t={t} onEdit={setEditMode} />
          <DeliveryCard
            order={order}
            customerName={customerName}
            t={t}
            onCreateNovaPoshtaWaybill={onCreateNovaPoshtaWaybill}
            onRemoveNovaPoshtaWaybill={onRemoveNovaPoshtaWaybill}
          />
          <PaymentCard order={order} t={t} />
        </S.SideColumn>
      </S.LayoutRoot>

      {editMode ? (
        <OrderEditModal
          order={order}
          open
          mode={editMode}
          onClose={() => setEditMode(null)}
          onUpdateOrder={onUpdateOrder}
        />
      ) : null}
    </>
  );
};
