import type {
  BillingCreditPricing,
  BillingCycle,
  BillingEntitlements,
  BillingInvoice,
  BillingInvoiceLineItem,
  BillingInvoiceStatus,
  BillingInvoicesListResponse,
  BillingPayInvoiceResponse,
  BillingPlan,
  BillingPlanEntitlements,
  BillingSubscription,
  BillingSubscriptionPlan,
} from "@/features/billing/model/billing.types";

import type {
  BillingChangeSubscriptionDto,
  BillingCreditPricingDto,
  BillingEntitlementsDto,
  BillingInvoiceDto,
  BillingInvoiceIdDto,
  BillingInvoiceLineItemDto,
  BillingInvoiceReferenceDto,
  BillingInvoicesListDto,
  BillingPayInvoiceDto,
  BillingPendingInvoiceDto,
  BillingPlanDto,
  BillingPlanEntitlementsDto,
  BillingPlansDto,
  BillingSubscriptionDto,
  BillingSubscriptionPlanDto,
} from "./billing-api.dtos";

const INVOICE_STATUSES = new Set<BillingInvoiceStatus>([
  "paid",
  "open",
  "void",
  "refunded",
]);

function normalizeInvoiceStatus(
  value: BillingInvoiceStatus | undefined,
): BillingInvoiceStatus {
  return value && INVOICE_STATUSES.has(value) ? value : "open";
}

function normalizeInvoiceId(
  value: BillingInvoiceIdDto | undefined | null,
): string {
  if (value == null) {
    return "";
  }

  return String(value).trim();
}

export function normalizeInvoiceReference(data: BillingInvoiceReferenceDto): {
  id: string;
} {
  const nestedId = normalizeInvoiceId(data.invoice?.id);

  if (nestedId) {
    return { id: nestedId };
  }

  const topLevelId =
    normalizeInvoiceId(data.invoiceId) || normalizeInvoiceId(data.id);

  if (topLevelId) {
    return { id: topLevelId };
  }

  return { id: "" };
}

function normalizePendingInvoice(
  pendingInvoice: BillingPendingInvoiceDto | null | undefined,
): BillingSubscription["pendingInvoice"] {
  if (pendingInvoice == null) {
    return null;
  }

  if (
    typeof pendingInvoice === "string" ||
    typeof pendingInvoice === "number"
  ) {
    const id = normalizeInvoiceId(pendingInvoice);
    return id ? { id, status: "open" } : null;
  }

  const id = normalizeInvoiceId(pendingInvoice.id);

  if (!id) {
    return null;
  }

  return {
    id,
    status: pendingInvoice.status
      ? normalizeInvoiceStatus(pendingInvoice.status)
      : "open",
  };
}

function normalizeBillingCycle(
  value: BillingCycle | undefined,
): BillingCycle | null {
  if (value === "monthly" || value === "yearly") {
    return value;
  }

  return null;
}

function normalizeSubscriptionPlan(
  plan: BillingSubscriptionPlanDto | undefined,
): BillingSubscriptionPlan | null {
  if (plan?.id == null) {
    return null;
  }

  return {
    id: plan.id,
    name: plan.name ?? "",
    slug: plan.slug ?? "",
  };
}

function normalizePlanEntitlements(
  entitlements: BillingPlanEntitlementsDto | undefined,
): BillingPlanEntitlements {
  return {
    socialAccountsLimit: entitlements?.socialAccountsLimit,
    privateAccountsLimit: entitlements?.privateAccountsLimit,
    aiCreditsMonthly: entitlements?.aiCreditsMonthly,
    usersLimit: entitlements?.usersLimit,
    productsLimit: entitlements?.productsLimit,
    wishlistEnabled: entitlements?.wishlistEnabled,
    advancedInventoryEnabled: entitlements?.advancedInventoryEnabled,
    advancedAnalyticsEnabled: entitlements?.advancedAnalyticsEnabled,
    novaPoshtaEnabled: entitlements?.novaPoshtaEnabled,
  };
}

export function normalizeBillingPlan(data: BillingPlanDto): BillingPlan {
  const entitlements = data.entitlements ?? data.planEntitlements;

  return {
    id: data.id,
    slug: data.slug ?? "",
    name: data.name ?? "",
    priceMonthly: data.priceMonthly ?? 0,
    priceYearly: data.priceYearly ?? 0,
    currency: data.currency ?? "UAH",
    isPublic: data.isPublic ?? true,
    entitlements: normalizePlanEntitlements(entitlements),
  };
}

export function normalizeBillingPlans(data: BillingPlansDto): BillingPlan[] {
  const items = Array.isArray(data) ? data : (data.items ?? data.plans ?? []);

  return items.map(normalizeBillingPlan);
}

export function normalizeBillingChangeSubscription(
  data: BillingChangeSubscriptionDto,
): { pendingPayment: boolean; invoice: { id: string } | null } {
  const invoiceReference = normalizeInvoiceReference(data);

  return {
    pendingPayment: data.pendingPayment ?? false,
    invoice: invoiceReference.id ? invoiceReference : null,
  };
}

function normalizeInvoiceLineItem(
  lineItem: BillingInvoiceLineItemDto,
): BillingInvoiceLineItem {
  return {
    type: lineItem.type,
    planSlug: lineItem.planSlug,
    billingCycle: lineItem.billingCycle,
    creditsAmount: lineItem.creditsAmount,
    description: lineItem.description,
  };
}

export function normalizeBillingCreditPricing(
  data: BillingCreditPricingDto,
): BillingCreditPricing {
  return {
    pricePerCredit: data.pricePerCredit ?? 0,
    currency: data.currency ?? "UAH",
    minPurchaseCredits: data.minPurchaseCredits ?? 0,
    maxPurchaseCredits: data.maxPurchaseCredits ?? 0,
    isActive: data.isActive ?? false,
  };
}

export function normalizeBillingEntitlements(
  data: BillingEntitlementsDto,
): BillingEntitlements {
  return {
    aiCreditsMonthly: data.aiCreditsMonthly ?? 0,
    aiCreditsUsed: data.aiCreditsUsed ?? 0,
    aiCreditsPurchased: data.aiCreditsPurchased ?? 0,
  };
}

export function normalizeBillingInvoice(
  data: BillingInvoiceDto,
): BillingInvoice {
  return {
    id: normalizeInvoiceId(data.id),
    number: data.number ?? "",
    paidAt: data.paidAt ?? null,
    createdAt: data.createdAt ?? "",
    description: data.description ?? null,
    amount: data.amount ?? 0,
    currency: data.currency ?? "UAH",
    status: normalizeInvoiceStatus(data.status),
    lineItems: (data.lineItems ?? []).map(normalizeInvoiceLineItem),
  };
}

export function normalizeBillingInvoicesList(
  data: BillingInvoicesListDto,
): BillingInvoicesListResponse {
  const items = (data.items ?? []).map(normalizeBillingInvoice);

  return {
    items,
    total: data.total ?? items.length,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 20,
  };
}

export function normalizeBillingSubscription(
  data: BillingSubscriptionDto,
): BillingSubscription {
  const plan = normalizeSubscriptionPlan(data.plan);

  return {
    planTemplateId: data.planTemplateId ?? plan?.id ?? null,
    billingCycle: normalizeBillingCycle(data.billingCycle),
    plan,
    status: data.status ?? null,
    periodEnd: data.periodEnd ?? data.paidUntil ?? null,
    pendingInvoice: normalizePendingInvoice(data.pendingInvoice),
    canRenew: data.canRenew ?? false,
    isExpired: data.isExpired ?? false,
    paidUntil: data.paidUntil ?? null,
  };
}

export function normalizeBillingPayInvoiceResponse(
  data: BillingPayInvoiceDto,
  fallbackInvoiceId: string,
): BillingPayInvoiceResponse {
  return {
    paymentUrl: data.paymentUrl ?? "",
    invoiceId: normalizeInvoiceId(data.invoiceId) || fallbackInvoiceId,
  };
}
