import type {
  OrderOnlinePayment,
  OrderPaymentTransaction,
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

  return null;
}

export function canActOnPendingPayment(status: string): boolean {
  return PENDING_PAYMENT_STATUSES.has(status);
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
