import dayjs from "dayjs";

import type { TFunction } from "i18next";

import type {
  BillingInvoice,
  BillingInvoiceLineItem,
} from "@/features/billing/model/billing.types";
import { BILLING_PENDING_PAYMENT_STORAGE_KEY } from "@/features/billing/model/billing.types";

export function formatBillingDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY") : "—";
}

export function formatBillingAmount(
  amount: number,
  currency = "UAH",
): string {
  const formatted = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/\u00A0/g, " ");

  const suffix = currency === "UAH" ? "грн" : currency;
  return `${formatted} ${suffix}`;
}

export function formatBillingCurrencySymbol(currency: string): string {
  if (currency === "UAH") {
    return "₴";
  }

  return currency;
}

export function formatPlanPriceValue(amount: number): string {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00A0/g, " ");
}

function formatPlanSlug(planSlug: string, t: TFunction): string {
  const key = `billing.planNames.${planSlug}`;
  const translated = t(key);
  return translated === key ? planSlug : translated;
}

function formatBillingCycle(billingCycle: string, t: TFunction): string {
  const key = `billing.billingCycles.${billingCycle}`;
  const translated = t(key);
  return translated === key ? billingCycle : translated;
}

export function formatInvoiceTariff(
  invoice: BillingInvoice,
  t: TFunction,
): string {
  const lineItem = invoice.lineItems[0];

  if (lineItem) {
    const fromLineItem = formatInvoiceLineItemTariff(lineItem, t);
    if (fromLineItem) {
      return fromLineItem;
    }
  }

  return invoice.description?.trim() || "—";
}

function formatInvoiceLineItemTariff(
  lineItem: BillingInvoiceLineItem,
  t: TFunction,
): string | null {
  if (lineItem.type === "credit_pack") {
    const creditsAmount = lineItem.creditsAmount ?? 0;
    return t("billing.invoiceTariff.creditPack", { count: creditsAmount });
  }

  if (lineItem.planSlug) {
    const plan = formatPlanSlug(lineItem.planSlug, t);
    if (lineItem.billingCycle) {
      return t("billing.invoiceTariff.subscription", {
        plan,
        cycle: formatBillingCycle(lineItem.billingCycle, t),
      });
    }

    return plan;
  }

  return lineItem.description?.trim() || null;
}

export function redirectToPayment(paymentUrl: string, invoiceId: string): void {
  sessionStorage.setItem(BILLING_PENDING_PAYMENT_STORAGE_KEY, invoiceId);
  window.location.href = paymentUrl;
}

export function consumePendingPaymentInvoiceId(): string | null {
  const invoiceId = sessionStorage.getItem(BILLING_PENDING_PAYMENT_STORAGE_KEY);

  if (!invoiceId) {
    return null;
  }

  sessionStorage.removeItem(BILLING_PENDING_PAYMENT_STORAGE_KEY);
  return invoiceId;
}
