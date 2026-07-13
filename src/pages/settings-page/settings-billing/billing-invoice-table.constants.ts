import type { BillingInvoiceStatus } from "@/features/billing/model/billing.types";

export const BILLING_INVOICE_STATUS_LABEL_KEYS: Record<
  BillingInvoiceStatus,
  string
> = {
  paid: "billing.invoiceStatus.paid",
  open: "billing.invoiceStatus.open",
  void: "billing.invoiceStatus.void",
  refunded: "billing.invoiceStatus.refunded",
};
