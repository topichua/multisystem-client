import { useCallback, useState } from "react";
import { Card, Flex, Tag } from "antd";
import { TruckIcon } from "@phosphor-icons/react";

import {
  EMPTY_VALUE,
  getDeliveryProviderLabel,
} from "../../../utils/order-details.utils";

import type { DeliveryCardProps } from "../order-details-content.types";
import { useNovaPoshtaWaybill } from "../hooks/use-nova-poshta-waybill";
import { DeliveryAddPanel } from "./delivery-card/delivery-add-panel";
import { DeliveryEmptyState } from "./delivery-card/delivery-empty-state";
import { DeliverySummary } from "./delivery-card/delivery-summary";

export const DeliveryCard = ({
  order,
  t,
  onCreateNovaPoshtaWaybill,
  onRemoveNovaPoshtaWaybill,
  onUpdateDelivery,
  onAttachDeliveryTracking,
}: DeliveryCardProps) => {
  const [addDeliveryOpen, setAddDeliveryOpen] = useState(false);
  const { waybillActionLoading, handleRemoveWaybill } = useNovaPoshtaWaybill({
    t,
    onRemoveNovaPoshtaWaybill,
  });

  const primaryDeliveryInfo = order.deliveryInfo;
  const trackingNumber = primaryDeliveryInfo?.trackingNumber;
  const hasDelivery = Boolean(primaryDeliveryInfo);
  const hasTracking = Boolean(trackingNumber);
  const showForm =
    (!hasDelivery && addDeliveryOpen) || (hasDelivery && !hasTracking);
  const providerLabel = getDeliveryProviderLabel(
    t,
    primaryDeliveryInfo?.provider,
  );
  const showProvider = hasDelivery && providerLabel !== EMPTY_VALUE;

  const handleCopyTrackingNumber = useCallback(() => {
    if (!trackingNumber) {
      return;
    }

    void navigator.clipboard?.writeText(trackingNumber);
  }, [trackingNumber]);

  return (
    <Card
      className="print-card"
      title={
        <Flex align="center" gap={10}>
          <TruckIcon size={20} />
          <span>{t("orders.delivery")}</span>
        </Flex>
      }
      extra={
        showProvider && (
          <Tag color="red" style={{ marginInlineEnd: 0, borderRadius: 999 }}>
            {providerLabel}
          </Tag>
        )
      }
    >
      {!hasDelivery && !addDeliveryOpen && (
        <DeliveryEmptyState t={t} onAdd={() => setAddDeliveryOpen(true)} />
      )}

      {showForm && (
        <DeliveryAddPanel
          primaryDeliveryInfo={primaryDeliveryInfo}
          t={t}
          onCreateNovaPoshtaWaybill={onCreateNovaPoshtaWaybill}
          onUpdateDelivery={onUpdateDelivery}
          onAttachDeliveryTracking={onAttachDeliveryTracking}
        />
      )}

      {hasTracking && primaryDeliveryInfo && (
        <DeliverySummary
          currency={order.currency}
          primaryDeliveryInfo={primaryDeliveryInfo}
          providerLabel={providerLabel}
          t={t}
          waybillActionLoading={waybillActionLoading}
          onCopyTrackingNumber={handleCopyTrackingNumber}
          onRemoveWaybill={handleRemoveWaybill}
        />
      )}
    </Card>
  );
};
