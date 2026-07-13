export type BillingCreditPricing = {
  pricePerCredit: number;
  currency: string;
  minPurchaseCredits: number;
  maxPurchaseCredits: number;
  isActive: boolean;
};

export type BillingEntitlements = {
  aiCreditsMonthly: number;
  aiCreditsUsed: number;
  aiCreditsPurchased: number;
};

export type BillingInvoiceStatus = "paid" | "open" | "void" | "refunded";

export type BillingSubscriptionStatus =
  | "active"
  | "trial"
  | "past_due"
  | string;

export type BillingCycle = "monthly" | "yearly";

export type BillingInvoiceLineItem = {
  type?: string;
  planSlug?: string;
  billingCycle?: string;
  creditsAmount?: number;
  description?: string;
};

export type BillingInvoice = {
  id: string;
  number: string;
  paidAt: string | null;
  createdAt: string;
  description: string | null;
  amount: number;
  currency: string;
  status: BillingInvoiceStatus;
  lineItems: BillingInvoiceLineItem[];
};

export type BillingInvoicesListResponse = {
  items: BillingInvoice[];
  total: number;
  page: number;
  pageSize: number;
};

export type BillingPendingInvoice = {
  id: string;
  status: BillingInvoiceStatus;
};

export type BillingSubscriptionPlan = {
  id: number;
  name: string;
  slug: string;
};

export type BillingSubscription = {
  planTemplateId: number | null;
  billingCycle: BillingCycle | null;
  plan: BillingSubscriptionPlan | null;
  status: BillingSubscriptionStatus | null;
  periodEnd: string | null;
  pendingInvoice: BillingPendingInvoice | null;
  canRenew: boolean;
  isExpired: boolean;
  paidUntil: string | null;
};

export type BillingPlanEntitlements = {
  socialAccountsLimit?: number | null;
  privateAccountsLimit?: number | null;
  aiCreditsMonthly?: number | null;
  usersLimit?: number | null;
  productsLimit?: number | null;
  wishlistEnabled?: boolean;
  advancedInventoryEnabled?: boolean;
  advancedAnalyticsEnabled?: boolean;
  novaPoshtaEnabled?: boolean;
};

export type BillingPlan = {
  id: number;
  slug: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  isPublic: boolean;
  entitlements: BillingPlanEntitlements;
};

export type BillingCreditsPurchaseResponse = {
  invoice: {
    id: string;
  };
};

export type BillingChangeSubscriptionResponse = {
  pendingPayment: boolean;
  invoice: {
    id: string;
  } | null;
};

export type BillingPayInvoiceResponse = {
  paymentUrl: string;
  invoiceId: string;
};

export type PayableInvoice = {
  id: string;
  status: BillingInvoiceStatus;
};

export const BILLING_PENDING_PAYMENT_STORAGE_KEY = "billingPendingInvoiceId";
