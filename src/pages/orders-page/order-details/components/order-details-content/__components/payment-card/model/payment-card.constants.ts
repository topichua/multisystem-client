import {
  CreditCardIcon,
  LinkSimpleIcon,
  WalletIcon,
} from "@phosphor-icons/react";

import type { PaymentCollectionMethodOption } from "./payment-card.types";

export const PAYMENT_COLLECTION_METHODS: PaymentCollectionMethodOption[] = [
  {
    key: "card_transfer",
    labelKey: "orders.details.paymentMethodCardTransfer",
    icon: CreditCardIcon,
  },
  {
    key: "online",
    labelKey: "orders.details.paymentMethodOnline",
    icon: LinkSimpleIcon,
  },
  {
    key: "cash",
    labelKey: "orders.details.paymentMethodCash",
    icon: WalletIcon,
  },
];

export const PAYMENT_TRANSACTION_STATUS_COLORS: Record<string, string> = {
  pending: "blue",
  awaiting_confirmation: "blue",
  awaiting_payment: "blue",
  created: "blue",
  processing: "blue",
  confirmed: "green",
  succeeded: "green",
  paid: "green",
  cancelled: "default",
  canceled: "default",
};
