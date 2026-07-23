import type { ManualPaymentMethod } from "@/features/integrations/model/integration.types";
import type { OrderPaymentTransaction } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";

import type { TranslationFn } from "../../../order-details-content.types";
import {
  isOnlinePaymentTransaction,
  resolvePaymentUrl,
} from "./payment-transaction.utils";

type BuildPaymentClientMessageParams = {
  transaction: OrderPaymentTransaction;
  currency: string;
  method: ManualPaymentMethod | null;
  t: TranslationFn;
};

function buildNoteLine(
  note: string | null | undefined,
  t: TranslationFn,
): string {
  const trimmed = note?.trim();

  if (!trimmed || /^https?:\/\//i.test(trimmed)) {
    return "";
  }

  return t("orders.details.paymentClientMessageNoteLine", { note: trimmed });
}

export function buildPaymentClientMessage({
  transaction,
  currency,
  method,
  t,
}: BuildPaymentClientMessageParams): string {
  const amount = formatMoney(
    transaction.amount,
    transaction.currency || currency,
  );
  const noteLine = buildNoteLine(transaction.note, t);

  if (isOnlinePaymentTransaction(transaction)) {
    const paymentUrl = resolvePaymentUrl(transaction);

    if (paymentUrl) {
      return t("orders.details.paymentClientMessageOnline", {
        amount,
        paymentUrl,
        noteLine,
      });
    }

    return t("orders.details.paymentClientMessageOnlineNoLink", {
      amount,
      noteLine,
    });
  }

  if (method) {
    const methodType = t(
      `integrations.manualPayment.types.${method.type === "card" ? "card" : "iban"}`,
    );

    return t("orders.details.paymentClientMessageTransfer", {
      methodType,
      account: method.displayValue || method.value,
      amount,
      noteLine,
    });
  }

  const kind = transaction.manualPaymentKind ?? transaction.method;

  if (kind === "cash" || kind === "manual") {
    return t("orders.details.paymentClientMessageCash", {
      amount,
      noteLine,
    });
  }

  if (transaction.manualPaymentMethodId == null) {
    return t("orders.details.paymentClientMessageCash", {
      amount,
      noteLine,
    });
  }

  const methodLabel = t(`orders.paymentMethodKind.${kind}`, {
    defaultValue: kind ?? t("orders.details.paymentFallback"),
  });

  return t("orders.details.paymentClientMessageGeneric", {
    method: methodLabel,
    amount,
    noteLine,
  });
}
