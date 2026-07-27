import {
  ArrowClockwiseIcon,
  CopySimpleIcon,
  MapPinIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Flex,
  Space,
  Typography,
} from "antd";
import type { DescriptionsProps } from "antd";

import {
  EMPTY_VALUE,
  formatMoney,
  formatText,
} from "../../../../utils/order-details.utils";
import type {
  DeliveryInfo,
  TranslationFn,
} from "../../order-details-content.types";
import {
  getDeliveryDestination,
  getDeliveryTypeLabel,
} from "../../utils/order-delivery-display.utils";
import {
  drawerKey,
  formatTrackingNumber,
  getDeliveryStatusLabel,
} from "./delivery-card.utils";

const { Text } = Typography;

type DeliverySummaryProps = {
  currency: string;
  primaryDeliveryInfo: NonNullable<DeliveryInfo>;
  providerLabel: string;
  t: TranslationFn;
  waybillActionLoading: boolean;
  onCopyTrackingNumber: () => void;
  onRemoveWaybill: () => void;
  onSyncPayment: () => void;
};

export function DeliverySummary({
  currency,
  primaryDeliveryInfo,
  providerLabel,
  t,
  waybillActionLoading,
  onCopyTrackingNumber,
  onRemoveWaybill,
  onSyncPayment,
}: DeliverySummaryProps) {
  const trackingNumber = primaryDeliveryInfo.trackingNumber;
  const destination = getDeliveryDestination(primaryDeliveryInfo);
  const canSyncPayment = primaryDeliveryInfo.canSyncPayment;
  const city = formatText(primaryDeliveryInfo.city);
  const destinationText =
    city !== EMPTY_VALUE && destination !== EMPTY_VALUE
      ? `${city}, ${destination}`
      : destination;
  const recipientText =
    [
      formatText(primaryDeliveryInfo.recipientName),
      formatText(primaryDeliveryInfo.phone),
    ]
      .filter((part) => part !== EMPTY_VALUE)
      .join(" · ") || EMPTY_VALUE;
  const paymentText = primaryDeliveryInfo.isCashOnDelivery
    ? `${t("orders.details.paymentCashOnDelivery")} · ${formatMoney(
        primaryDeliveryInfo.cashOnDeliveryAmount,
        currency,
      )}`
    : t(drawerKey("prepayment"));

  const items: DescriptionsProps["items"] = [
    {
      key: "provider",
      label: t("orders.deliveryProvider"),
      children: providerLabel,
    },
    {
      key: "type",
      label: t("orders.details.deliveryType"),
      children: getDeliveryTypeLabel(primaryDeliveryInfo, t),
    },
    {
      key: "destination",
      label: t("orders.warehouse"),
      children: (
        <Flex align="flex-start" gap={6}>
          <MapPinIcon size={16} />
          <span>{destinationText}</span>
        </Flex>
      ),
    },
    {
      key: "recipient",
      label: t("orders.recipientName"),
      children: recipientText,
    },
    {
      key: "payment",
      label: t("orders.payment"),
      children: <Text type="success">{paymentText}</Text>,
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Card size="small">
        <Flex align="center" justify="space-between" gap={16} wrap>
          <Space orientation="vertical" size={2}>
            <Text type="secondary">{t("orders.details.waybillNumber")}</Text>
            <Text strong>{formatTrackingNumber(trackingNumber)}</Text>
          </Space>

          <Button
            disabled={!trackingNumber}
            icon={<CopySimpleIcon size={18} />}
            onClick={onCopyTrackingNumber}
          >
            {t("orders.details.copy")}
          </Button>
        </Flex>
      </Card>

      <Alert
        showIcon
        type="info"
        title={getDeliveryStatusLabel(primaryDeliveryInfo.deliveryStatus, t)}
        description={primaryDeliveryInfo.providerStatusText || undefined}
      />

      <Descriptions column={{ xs: 1, md: 2 }} items={items} />

      <Flex
        align="center"
        justify={canSyncPayment ? "space-between" : "center"}
        gap={16}
      >
        {canSyncPayment && (
          <Button
            block={canSyncPayment}
            type="primary"
            disabled={waybillActionLoading}
            icon={<ArrowClockwiseIcon size={18} />}
            loading={waybillActionLoading}
            onClick={onSyncPayment}
          >
            {t("orders.details.deliveryPaymentSync")}
          </Button>
        )}
        <Button
          block={canSyncPayment}
          danger
          disabled={waybillActionLoading}
          icon={<TrashIcon size={18} />}
          loading={waybillActionLoading}
          onClick={onRemoveWaybill}
        >
          {t("orders.details.removeDelivery")}
        </Button>
      </Flex>
    </Space>
  );
}
