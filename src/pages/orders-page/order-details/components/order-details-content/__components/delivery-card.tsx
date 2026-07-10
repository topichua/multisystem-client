import { TrashIcon, TruckIcon } from "@phosphor-icons/react";
import { Button, Flex } from "antd";

import {
  EMPTY_VALUE,
  formatMoney,
  formatText,
  getDeliveryProviderLabel,
} from "../../../utils/order-details.utils";
import { DeliveryStatusTag } from "../../order-status-tags";

import type { DeliveryCardProps } from "../order-details-content.types";
import { useNovaPoshtaWaybill } from "../hooks/use-nova-poshta-waybill";
import {
  getDeliveryDestination,
  getDeliveryTypeLabel,
} from "../utils/order-delivery-display.utils";
import { DeliveryWaybillForm } from "./delivery-waybill-form";
import { CopyableText, InfoList } from "./info-list";
import * as S from "../order-details-content.styled";

export const DeliveryCard = ({
  order,
  customerName,
  t,
  onCreateNovaPoshtaWaybill,
  onRemoveNovaPoshtaWaybill,
}: DeliveryCardProps) => {
  const {
    primaryDeliveryInfo,
    waybillForm,
    waybillInitialValues,
    waybillActionLoading,
    hasTrackingNumber,
    deliveryShipped,
    createDisabledReason,
    removeDisabledReason,
    canCreateWaybill,
    canRemoveWaybill,
    handleCreateWaybill,
    handleRemoveWaybill,
  } = useNovaPoshtaWaybill({
    order,
    t,
    onCreateNovaPoshtaWaybill,
    onRemoveNovaPoshtaWaybill,
  });

  const providerLabel = getDeliveryProviderLabel(
    t,
    primaryDeliveryInfo?.provider,
  );

  return (
    <S.DetailsCard className="print-card section-delivery">
      <S.CardHeader>
        <Flex align="center" gap={10}>
          <S.MutedIcon>
            <TruckIcon size={20} />
          </S.MutedIcon>
          <S.CardTitle level={3}>{t("orders.delivery")}</S.CardTitle>
        </Flex>

        <Flex align="center" gap={8} justify="end" wrap>
          {primaryDeliveryInfo?.provider ? (
            <S.ProviderTag color="red">{providerLabel}</S.ProviderTag>
          ) : null}

          {hasTrackingNumber ? (
            <Button
              className="no-print"
              danger
              disabled={!canRemoveWaybill || waybillActionLoading}
              icon={<TrashIcon size={18} />}
              loading={waybillActionLoading}
              title={removeDisabledReason ?? undefined}
              onClick={handleRemoveWaybill}
            >
              {t("orders.details.removeWaybill")}
            </Button>
          ) : null}
        </Flex>
      </S.CardHeader>

      <S.TrackingPanel>
        <S.TrackingLabel>{t("orders.details.waybillNumber")}</S.TrackingLabel>
        {primaryDeliveryInfo?.trackingNumber ? (
          <S.TrackingNumber copyable>
            {primaryDeliveryInfo.trackingNumber}
          </S.TrackingNumber>
        ) : (
          <S.TrackingNumber>{EMPTY_VALUE}</S.TrackingNumber>
        )}
      </S.TrackingPanel>

      {!hasTrackingNumber ? (
        <DeliveryWaybillForm
          order={order}
          t={t}
          waybillForm={waybillForm}
          waybillInitialValues={waybillInitialValues}
          deliveryShipped={deliveryShipped}
          waybillActionLoading={waybillActionLoading}
          createDisabledReason={createDisabledReason}
          canCreateWaybill={canCreateWaybill}
          onCreateWaybill={() => void handleCreateWaybill()}
        />
      ) : null}

      <S.DeliveryStatusBox>
        <DeliveryStatusTag value={primaryDeliveryInfo?.deliveryStatus} />
      </S.DeliveryStatusBox>

      <InfoList
        items={[
          {
            key: "type",
            label: t("orders.details.deliveryType"),
            value: getDeliveryTypeLabel(primaryDeliveryInfo, t),
          },
          {
            key: "city",
            label: t("orders.city"),
            value: formatText(primaryDeliveryInfo?.city),
          },
          {
            key: "warehouse",
            label: t("orders.warehouse"),
            value: getDeliveryDestination(primaryDeliveryInfo),
          },
          {
            key: "recipient",
            label: t("orders.recipientName"),
            value: formatText(
              primaryDeliveryInfo?.recipientName || customerName,
            ),
          },
          {
            key: "phone",
            label: t("orders.phone"),
            value: <CopyableText value={primaryDeliveryInfo?.phone} />,
          },
          {
            key: "cost",
            label: t("orders.price"),
            value: formatMoney(order.deliveryAmount, order.currency),
          },
        ]}
      />
    </S.DetailsCard>
  );
};
