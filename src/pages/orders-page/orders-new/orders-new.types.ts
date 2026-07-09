import type { Client } from "@/features/clients/model/client.types";
import type { OrderDraftLine } from "@/features/orders/model/order.types";

export type ClientMode = "existing" | "new";

export type ClientWithVipMarker = Client & {
  isVip?: boolean;
  tags?: string[];
  vip?: boolean;
};

export type NewClientFormValues = {
  clientFirstName?: string;
  clientLastName?: string;
  clientPhone?: string;
};

export type OrderNewLine = OrderDraftLine & {
  discountOpen: boolean;
  discountPercent: number;
};

export type PaymentMethodValue = "cash_on_delivery" | "prepayment";
