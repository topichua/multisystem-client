import type { CSSProperties } from 'react';

export type DeliveryStatus =
  | 'pending'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'failed'
  | 'returned'
  | 'canceled';

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'failed'
  | 'canceled';

export type OrderStatusVisual = {
  color: string;
  i18nKey: string;
};

const defaultStatusColor = '#64748b';

export const DELIVERY_STATUS_MAP: Record<DeliveryStatus, OrderStatusVisual> = {
  pending: { color: '#64748b', i18nKey: 'pending' },
  processing: { color: '#3b82f6', i18nKey: 'processing' },
  packed: { color: '#0ea5e9', i18nKey: 'packed' },
  shipped: { color: '#6366f1', i18nKey: 'shipped' },
  delivered: { color: '#22c55e', i18nKey: 'delivered' },
  failed: { color: '#ef4444', i18nKey: 'failed' },
  returned: { color: '#a855f7', i18nKey: 'returned' },
  canceled: { color: '#6b7280', i18nKey: 'canceled' },
};

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, OrderStatusVisual> = {
  unpaid: { color: '#f97316', i18nKey: 'unpaid' },
  pending: { color: '#eab308', i18nKey: 'pending' },
  paid: { color: '#22c55e', i18nKey: 'paid' },
  partially_paid: { color: '#06b6d4', i18nKey: 'partially_paid' },
  refunded: { color: '#a855f7', i18nKey: 'refunded' },
  failed: { color: '#ef4444', i18nKey: 'failed' },
  canceled: { color: '#6b7280', i18nKey: 'canceled' },
};

const deliveryStatusAliases: Record<string, DeliveryStatus> = {
  cancelled: 'canceled',
};

const paymentStatusAliases: Record<string, PaymentStatus> = {
  cancelled: 'canceled',
};

function normalizeDeliveryStatus(status: string): DeliveryStatus | null {
  const key = deliveryStatusAliases[status] ?? status;
  return key in DELIVERY_STATUS_MAP ? (key as DeliveryStatus) : null;
}

function normalizePaymentStatus(status: string): PaymentStatus | null {
  const key = paymentStatusAliases[status] ?? status;
  return key in PAYMENT_STATUS_MAP ? (key as PaymentStatus) : null;
}

export function getDeliveryStatusVisual(status: string): OrderStatusVisual {
  const normalized = normalizeDeliveryStatus(status);
  if (normalized) {
    return DELIVERY_STATUS_MAP[normalized];
  }

  return { color: defaultStatusColor, i18nKey: status };
}

export function getPaymentStatusVisual(status: string): OrderStatusVisual {
  const normalized = normalizePaymentStatus(status);
  if (normalized) {
    return PAYMENT_STATUS_MAP[normalized];
  }

  return { color: defaultStatusColor, i18nKey: status };
}

export function orderStatusTagStyle(color: string): CSSProperties {
  return {
    margin: 0,
    color,
    borderColor: color,
    background: `${color}14`,
  };
}
