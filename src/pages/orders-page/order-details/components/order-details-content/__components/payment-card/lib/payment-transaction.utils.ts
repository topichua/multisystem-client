import type {
  OrderOnlinePayment,
  OrderPaymentTransaction,
  OrderRefund,
} from "@/features/orders/model/order.types";

const ONLINE_METHOD_KINDS = new Set([
  "online",
  "online_payment",
  "acquiring",
  "monobank",
]);

const PENDING_PAYMENT_STATUSES = new Set([
  "pending",
  "awaiting_confirmation",
  "awaiting_payment",
  "created",
  "processing",
]);

const CONFIRMED_PAYMENT_STATUSES = new Set(["confirmed", "succeeded", "paid"]);

const PENDING_REFUND_STATUSES = new Set(["pending", "awaiting_confirmation"]);

const CONFIRMED_REFUND_STATUSES = new Set([
  "approved",
  "confirmed",
  "succeeded",
  "completed",
]);

const DELIVERY_PAYMENT_KINDS = new Set(["nova_poshta_payment"]);

export type PaymentTimelineItem =
  | {
      kind: "payment";
      key: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
      occurredAt: string | null;
      transaction: OrderPaymentTransaction;
    }
  | {
      kind: "refund";
      key: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
      occurredAt: string | null;
      note: string | null;
      refund: OrderRefund;
    };

export function isOnlinePaymentTransaction(
  transaction: OrderPaymentTransaction,
): boolean {
  const kind = (
    transaction.manualPaymentKind ??
    transaction.method ??
    transaction.type ??
    ""
  ).toLowerCase();

  if (ONLINE_METHOD_KINDS.has(kind)) {
    return true;
  }

  if (transaction.provider && transaction.manualPaymentMethodId == null) {
    const provider = transaction.provider.toLowerCase();
    return provider === "monobank" || provider.includes("mono");
  }

  return false;
}

export function isRefundLikeTransaction(
  transaction: OrderPaymentTransaction,
): boolean {
  if (transaction.amount < 0) {
    return true;
  }

  const kind = (
    transaction.manualPaymentKind ??
    transaction.method ??
    transaction.type ??
    ""
  ).toLowerCase();

  return kind.includes("refund") || kind.includes("return");
}

export function isDeliveryPaymentTransaction(
  transaction: OrderPaymentTransaction,
): boolean {
  const kinds = [
    transaction.source,
    transaction.method,
    transaction.manualPaymentKind,
  ];

  return kinds.some(
    (kind) => kind != null && DELIVERY_PAYMENT_KINDS.has(kind.toLowerCase()),
  );
}

export function mapOnlinePaymentToTransaction(
  payment: OrderOnlinePayment,
): OrderPaymentTransaction {
  return {
    id: payment.id,
    orderId: payment.orderId,
    paymentId: payment.id,
    provider: payment.provider,
    type: null,
    method: payment.method,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    source: null,
    externalTransactionId: payment.externalPaymentId,
    note: null,
    manualPaymentMethodId: null,
    paymentUrl: payment.paymentUrl,
    occurredAt: payment.paidAt,
    createdAt: payment.createdAt,
  };
}

export function resolvePaymentUrl(
  transaction: OrderPaymentTransaction,
): string | null {
  const urls = [
    transaction.paymentUrl,
    transaction.checkoutUrl,
    transaction.pageUrl,
  ];

  for (const rawUrl of urls) {
    const url = rawUrl?.trim();

    if (url && /^https?:\/\//i.test(url)) {
      return url;
    }
  }

  return null;
}

export function resolvePaymentDeleteId(
  transaction: OrderPaymentTransaction,
): number | null {
  if (typeof transaction.paymentId === "number") {
    return transaction.paymentId;
  }

  // DELETE /orders/:orderId/payments/:paymentId accepts a pending payment
  // transaction id from order.payment.payments[] when paymentId is not present.
  return transaction.id;
}

export function isPendingPaymentStatus(status: string): boolean {
  return PENDING_PAYMENT_STATUSES.has(status);
}

export function canActOnPendingPayment(
  transaction: OrderPaymentTransaction,
): boolean {
  return (
    isPendingPaymentStatus(transaction.status) &&
    !isDeliveryPaymentTransaction(transaction)
  );
}

export function hasPendingActionablePayments(
  transactions: OrderPaymentTransaction[],
): boolean {
  return transactions.some((transaction) =>
    canActOnPendingPayment(transaction),
  );
}

export function isConfirmedPaymentStatus(status: string): boolean {
  return CONFIRMED_PAYMENT_STATUSES.has(status);
}

export function hasConfirmedPayments(
  transactions: OrderPaymentTransaction[],
): boolean {
  return transactions.some((transaction) =>
    isConfirmedPaymentStatus(transaction.status),
  );
}

export function canActOnPendingRefund(status: string): boolean {
  return PENDING_REFUND_STATUSES.has(status);
}

export function isConfirmedRefundStatus(status: string): boolean {
  return CONFIRMED_REFUND_STATUSES.has(status);
}

export function hasPendingRefunds(refunds: OrderRefund[]): boolean {
  return refunds.some((refund) => canActOnPendingRefund(refund.status));
}

export function hasPendingOnlinePayments(
  payments: OrderOnlinePayment[],
): boolean {
  return payments.some((payment) =>
    PENDING_PAYMENT_STATUSES.has(payment.status),
  );
}

export function getPaymentTransactionListKey(
  transaction: OrderPaymentTransaction,
): string {
  if (isOnlinePaymentTransaction(transaction)) {
    return `online:${transaction.paymentId ?? transaction.id}`;
  }

  return `tx:${transaction.id}`;
}

export function mergePaymentTransactions(
  orderTransactions: OrderPaymentTransaction[],
  paymentsSummary: {
    payments?: OrderOnlinePayment[] | null;
  } | null,
): OrderPaymentTransaction[] {
  const summaryLoaded = paymentsSummary != null;
  const onlineTransactions = (paymentsSummary?.payments ?? []).map(
    mapOnlinePaymentToTransaction,
  );
  const seenKeys = new Set<string>();
  const merged: OrderPaymentTransaction[] = [];

  for (const transaction of onlineTransactions) {
    const key = getPaymentTransactionListKey(transaction);

    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    merged.push(transaction);
  }

  for (const transaction of orderTransactions) {
    if (summaryLoaded && isOnlinePaymentTransaction(transaction)) {
      continue;
    }

    const key = getPaymentTransactionListKey(transaction);

    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    merged.push(transaction);
  }

  return merged.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function buildPaymentTimelineItems(
  transactions: OrderPaymentTransaction[],
  refunds: OrderRefund[],
): PaymentTimelineItem[] {
  const refundTransactionIds = new Set(
    refunds
      .map((refund) => refund.paymentTransactionId)
      .filter((id): id is number => typeof id === "number"),
  );

  const paymentItems: PaymentTimelineItem[] = transactions
    .filter(
      (transaction) =>
        !isRefundLikeTransaction(transaction) &&
        !refundTransactionIds.has(transaction.id),
    )
    .map((transaction) => ({
      kind: "payment" as const,
      key: getPaymentTransactionListKey(transaction),
      amount: Math.abs(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      createdAt: transaction.createdAt,
      occurredAt: transaction.occurredAt,
      transaction,
    }));

  const refundItems: PaymentTimelineItem[] = refunds.map((refund) => ({
    kind: "refund" as const,
    key: `refund:${refund.id}`,
    amount: Math.abs(refund.amount),
    currency: refund.currency,
    status: refund.status,
    createdAt: refund.createdAt,
    occurredAt: refund.occurredAt,
    note: refund.note,
    refund,
  }));

  return [...paymentItems, ...refundItems].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}
