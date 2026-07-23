import { Alert, Drawer, Flex, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { DeliveryCard } from "@/pages/orders-page/order-details/components/order-details-content/__components/delivery-card/delivery-card";
import { PaymentCard } from "@/pages/orders-page/order-details/components/order-details-content/__components/payment-card/payment-card";
import { ProductsCard } from "@/pages/orders-page/order-details/components/order-details-content/__components/products-card";
import { useOrderDetails } from "@/pages/orders-page/order-details/hooks/use-order-details";
import {
  EMPTY_VALUE,
  getCustomerName,
} from "@/pages/orders-page/order-details/utils/order-details.utils";

const { Text } = Typography;

type CurrentOrderDrawerProps = {
  open: boolean;
  orderId: number | null;
  onClose: () => void;
};

export function CurrentOrderDrawer({
  open,
  orderId,
  onClose,
}: CurrentOrderDrawerProps) {
  const { t } = useTranslation();
  const activeOrderId = open ? orderId : null;
  const {
    order,
    loading,
    error,
    createNovaPoshtaWaybill,
    removeNovaPoshtaWaybill,
    updateDelivery,
    attachDeliveryTracking,
    createManualPayment,
    createOnlinePayment,
    confirmPaymentTransaction,
    deletePayment,
    createOrderRefund,
    approveOrderRefund,
    deleteOrderRefund,
    refreshOrder,
  } = useOrderDetails(activeOrderId);

  const customerName = order ? getCustomerName(order.customer) : null;
  const showCustomerName = customerName != null && customerName !== EMPTY_VALUE;

  return (
    <Drawer
      title={
        <Flex vertical>
          <span>
            {orderId != null
              ? t("conversation.clientOrders.orderNumber", { id: orderId })
              : t("conversation.clientOrders.currentOrder")}
          </span>
          {showCustomerName && (
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
              {customerName}
            </Text>
          )}
        </Flex>
      }
      placement="left"
      open={open}
      onClose={onClose}
      mask={false}
      keyboard={false}
      focusable={{ trap: false }}
      closable={{
        "aria-label": t("conversation.clientOrders.closeDrawerAria"),
        placement: "end",
      }}
      size={540}
      destroyOnHidden
      data-qa="layout-conversation-details-current-order-drawer"
      styles={{
        wrapper: {
          pointerEvents: "none",
        },
        content: {
          pointerEvents: "auto",
        },
        header: {
          padding: "18px 18px 14px",
        },
        body: {
          padding: "18px",
        },
      }}
    >
      <Spin spinning={loading}>
        <Flex vertical gap={16}>
          {error && <Alert type="error" showIcon title={error} />}

          {!error && !loading && !order && (
            <Text type="secondary">{t("orders.notFound")}</Text>
          )}

          {order && (
            <>
              <ProductsCard productCardSize="small" order={order} t={t} />
              <DeliveryCard
                order={order}
                t={t}
                onCreateNovaPoshtaWaybill={createNovaPoshtaWaybill}
                onRemoveNovaPoshtaWaybill={removeNovaPoshtaWaybill}
                onUpdateDelivery={updateDelivery}
                onAttachDeliveryTracking={attachDeliveryTracking}
              />
              <PaymentCard
                order={order}
                t={t}
                onCreateManualPayment={createManualPayment}
                onCreateOnlinePayment={createOnlinePayment}
                onConfirmPaymentTransaction={confirmPaymentTransaction}
                onDeletePayment={deletePayment}
                onCreateOrderRefund={createOrderRefund}
                onApproveOrderRefund={approveOrderRefund}
                onDeleteOrderRefund={deleteOrderRefund}
                onRefreshOrder={refreshOrder}
              />
            </>
          )}
        </Flex>
      </Spin>
    </Drawer>
  );
}
