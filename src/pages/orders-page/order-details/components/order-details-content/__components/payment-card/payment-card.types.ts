import type { Icon } from "@phosphor-icons/react";

export type PaymentCollectionMethod = "card_transfer" | "online" | "cash";

export type PaymentCardView =
  | "summary"
  | "select_method"
  | "cash"
  | "card_transfer"
  | "online"
  | "refund";

export type PaymentCollectionMethodOption = {
  key: PaymentCollectionMethod;
  labelKey: string;
  icon: Icon;
};

/** Maps selectable collection methods to an implemented form view. */
export const PAYMENT_METHOD_VIEWS: Partial<
  Record<
    PaymentCollectionMethod,
    Exclude<PaymentCardView, "summary" | "select_method">
  >
> = {
  cash: "cash",
  card_transfer: "card_transfer",
  online: "online",
};
