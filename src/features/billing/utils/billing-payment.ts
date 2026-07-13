import type { TFunction } from "i18next";

import type {
  BillingCycle,
  BillingInvoice,
  BillingPlan,
  BillingPlanEntitlements,
  BillingSubscription,
  PayableInvoice,
} from "@/features/billing/model/billing.types";

import { formatBillingDate } from "./billing-format";

export function resolvePayableInvoice(
  subscription: BillingSubscription,
  invoices: BillingInvoice[],
): PayableInvoice | null {
  if (subscription.pendingInvoice?.status === "open") {
    return subscription.pendingInvoice;
  }

  const openFromList = invoices.find((invoice) => invoice.status === "open");

  if (openFromList) {
    return { id: openFromList.id, status: openFromList.status };
  }

  return null;
}

export type BillingPaymentButtonState = {
  enabled: boolean;
  labelKey: string;
  helperKey?: string;
  helperValues?: Record<string, string>;
  action: "pay" | "renew" | null;
  payableInvoiceId: string | null;
};

export function getBillingPaymentButtonState(
  subscription: BillingSubscription,
  invoices: BillingInvoice[],
  options?: { isFreePlan?: boolean },
): BillingPaymentButtonState {
  const payable = resolvePayableInvoice(subscription, invoices);
  const periodEnd = subscription.periodEnd ?? subscription.paidUntil;

  if (payable) {
    return {
      enabled: true,
      labelKey: "billing.paymentMethod.payTariff",
      action: "pay",
      payableInvoiceId: payable.id,
    };
  }

  if (subscription.canRenew && subscription.isExpired) {
    return {
      enabled: true,
      labelKey: "billing.paymentMethod.renewTariff",
      action: "renew",
      payableInvoiceId: null,
    };
  }

  if (periodEnd && !subscription.isExpired) {
    return {
      enabled: false,
      labelKey: "billing.paymentMethod.payTariff",
      helperKey: "billing.paymentMethod.paidUntil",
      helperValues: { date: formatBillingDate(periodEnd) },
      action: null,
      payableInvoiceId: null,
    };
  }

  if (options?.isFreePlan) {
    return {
      enabled: false,
      labelKey: "billing.paymentMethod.payTariff",
      helperKey: "billing.paymentMethod.choosePlanBelow",
      action: null,
      payableInvoiceId: null,
    };
  }

  return {
    enabled: false,
    labelKey: "billing.paymentMethod.payTariff",
    action: null,
    payableInvoiceId: null,
  };
}

export function getYearlyDiscountPercent(plan: BillingPlan): number {
  if (plan.priceMonthly <= 0 || plan.priceYearly <= 0) {
    return 0;
  }

  const monthlyAnnual = plan.priceMonthly * 12;

  if (monthlyAnnual <= 0) {
    return 0;
  }

  return Math.round((1 - plan.priceYearly / monthlyAnnual) * 100);
}

export function getMaxYearlyDiscountPercent(plans: BillingPlan[]): number {
  return plans.reduce(
    (max, plan) => Math.max(max, getYearlyDiscountPercent(plan)),
    0,
  );
}

export function getPlanPrice(
  plan: BillingPlan,
  billingCycle: BillingCycle,
): number {
  return billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
}

export function isCurrentPlan(
  subscription: BillingSubscription,
  plan: BillingPlan,
  selectedBillingCycle: BillingCycle,
): boolean {
  return (
    subscription.planTemplateId === plan.id &&
    subscription.billingCycle === selectedBillingCycle
  );
}

export function getPlanCta(
  subscription: BillingSubscription,
  plan: BillingPlan,
  selectedBillingCycle: BillingCycle,
  t: TFunction,
): { label: string; disabled: boolean } {
  if (isCurrentPlan(subscription, plan, selectedBillingCycle)) {
    return { label: t("billing.plans.currentPlan"), disabled: true };
  }

  if (plan.priceMonthly === 0 && plan.priceYearly === 0) {
    return { label: t("billing.plans.tryFree"), disabled: false };
  }

  return {
    label: t("billing.plans.choosePlan", { name: plan.name }),
    disabled: false,
  };
}

type PlanFeature = {
  key: string;
  label: string;
};

export function getPlanFeatures(
  entitlements: BillingPlanEntitlements,
  t: TFunction,
): PlanFeature[] {
  const features: PlanFeature[] = [];

  if (entitlements.socialAccountsLimit != null) {
    features.push({
      key: "socialAccountsLimit",
      label: t("billing.plans.features.socialAccounts", {
        count: entitlements.socialAccountsLimit,
      }),
    });
  }

  if (entitlements.privateAccountsLimit != null) {
    features.push({
      key: "privateAccountsLimit",
      label: t("billing.plans.features.privateAccounts", {
        count: entitlements.privateAccountsLimit,
      }),
    });
  }

  if (entitlements.aiCreditsMonthly != null) {
    features.push({
      key: "aiCreditsMonthly",
      label: t("billing.plans.features.aiCredits", {
        count: entitlements.aiCreditsMonthly,
      }),
    });
  }

  if (entitlements.usersLimit != null) {
    features.push({
      key: "usersLimit",
      label: t("billing.plans.features.users", {
        count: entitlements.usersLimit,
      }),
    });
  }

  if (entitlements.productsLimit != null) {
    features.push({
      key: "productsLimit",
      label: t("billing.plans.features.products", {
        count: entitlements.productsLimit,
      }),
    });
  }

  if (entitlements.wishlistEnabled) {
    features.push({
      key: "wishlistEnabled",
      label: t("billing.plans.features.wishlist"),
    });
  }

  if (entitlements.advancedInventoryEnabled) {
    features.push({
      key: "advancedInventoryEnabled",
      label: t("billing.plans.features.advancedInventory"),
    });
  }

  if (entitlements.advancedAnalyticsEnabled) {
    features.push({
      key: "advancedAnalyticsEnabled",
      label: t("billing.plans.features.advancedAnalytics"),
    });
  }

  if (entitlements.novaPoshtaEnabled) {
    features.push({
      key: "novaPoshtaEnabled",
      label: t("billing.plans.features.novaPoshta"),
    });
  }

  return features;
}

export function getPublicPlans(plans: BillingPlan[]): BillingPlan[] {
  return plans.filter((plan) => plan.isPublic);
}

export function isFreeSubscriptionPlan(
  subscription: BillingSubscription,
  plans: BillingPlan[],
): boolean {
  if (!subscription.planTemplateId) {
    return true;
  }

  const currentPlan = plans.find(
    (plan) => plan.id === subscription.planTemplateId,
  );
  return (
    currentPlan != null &&
    currentPlan.priceMonthly === 0 &&
    currentPlan.priceYearly === 0
  );
}
