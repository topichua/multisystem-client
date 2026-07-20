import type { NovaPoshtaDeliveryType } from "@/features/integrations/model/integration.types";
import type { OrderFormValues } from "@/features/orders/model/order.types";

import type {
  DeliveryCardProps,
  DeliveryInfo,
  TranslationFn,
} from "../../order-details-content.types";

export type DeliveryAddMode = "create" | "existing";
export type PaymentMode = "cash_on_delivery" | "prepayment";

export type DeliveryAddFormValues = OrderFormValues & {
  paymentMode?: PaymentMode;
  recipientName?: string;
  trackingNumber?: string;
  weightKg?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  lengthCm?: number | null;
  seatsAmount?: number | null;
  shipmentType?: NovaPoshtaDeliveryType;
};

export type DeliveryAddPanelProps = {
  primaryDeliveryInfo: DeliveryInfo;
  t: TranslationFn;
  onCreateNovaPoshtaWaybill: DeliveryCardProps["onCreateNovaPoshtaWaybill"];
  onUpdateDelivery: DeliveryCardProps["onUpdateDelivery"];
  onAttachDeliveryTracking: DeliveryCardProps["onAttachDeliveryTracking"];
};
