import type { ReactNode } from "react";
import type { useTranslation } from "react-i18next";

import type {
  OrderDetails,
  OrderNovaPoshtaWaybillPayload,
  OrderUpdatePayload,
} from "@/features/orders/model/order.types";

import type { OrderEditMode } from "@/pages/orders-page/order-details/order-details.types";

export type TranslationFn = ReturnType<typeof useTranslation>["t"];
export type OrderItem = OrderDetails["items"][number];
export type DeliveryInfo = OrderDetails["deliveryInfo"];
export type EventTone = "blue" | "green" | "gold" | "purple" | "gray";

export type OrderDetailsContentProps = {
  order: OrderDetails;
  onCreateNovaPoshtaWaybill: (
    payload: OrderNovaPoshtaWaybillPayload,
  ) => Promise<void>;
  onRemoveNovaPoshtaWaybill: () => Promise<void>;
  onUpdateOrder: (payload: OrderUpdatePayload) => Promise<void>;
};

export type InfoItem = {
  key: string;
  label: ReactNode;
  value: ReactNode;
};

export type OrderSectionProps = {
  order: OrderDetails;
  t: TranslationFn;
};

export type EditableSectionProps = OrderSectionProps & {
  onEdit: (mode: OrderEditMode) => void;
};

export type CustomerSectionProps = OrderSectionProps & {
  customerName: string;
};

export type DeliveryCardProps = CustomerSectionProps & {
  onCreateNovaPoshtaWaybill: (
    payload: OrderNovaPoshtaWaybillPayload,
  ) => Promise<void>;
  onRemoveNovaPoshtaWaybill: () => Promise<void>;
};
