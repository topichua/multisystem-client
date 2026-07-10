import type {
  BillingCycle,
  BillingInvoiceStatus,
  BillingSubscriptionStatus,
} from "@/features/billing/model/billing.types";

export type BillingInvoiceIdDto = string | number;

export type BillingInvoiceLineItemDto = {
  type?: string;
  planSlug?: string;
  billingCycle?: string;
  creditsAmount?: number;
  description?: string;
};

export type BillingInvoiceDto = {
  id: BillingInvoiceIdDto;
  number?: string;
  paidAt?: string | null;
  createdAt?: string;
  description?: string | null;
  amount?: number;
  currency?: string;
  status?: BillingInvoiceStatus;
  lineItems?: BillingInvoiceLineItemDto[];
};

export type BillingInvoicesListDto = {
  items?: BillingInvoiceDto[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export type BillingPendingInvoiceDto =
  | BillingInvoiceIdDto
  | {
      id: BillingInvoiceIdDto;
      status?: BillingInvoiceStatus;
    };

export type BillingSubscriptionPlanDto = {
  id: number;
  name?: string;
  slug?: string;
};

export type BillingSubscriptionDto = {
  planTemplateId?: number;
  billingCycle?: BillingCycle;
  plan?: BillingSubscriptionPlanDto;
  status?: BillingSubscriptionStatus;
  periodEnd?: string | null;
  paidUntil?: string | null;
  pendingInvoice?: BillingPendingInvoiceDto | null;
  canRenew?: boolean;
  isExpired?: boolean;
};

export type BillingPlanEntitlementsDto = {
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

export type BillingPlanDto = {
  id: number;
  slug?: string;
  name?: string;
  priceMonthly?: number;
  priceYearly?: number;
  currency?: string;
  isPublic?: boolean;
  entitlements?: BillingPlanEntitlementsDto;
  planEntitlements?: BillingPlanEntitlementsDto;
};

export type BillingPlansDto =
  | BillingPlanDto[]
  | {
      items?: BillingPlanDto[];
      plans?: BillingPlanDto[];
    };

export type BillingCreditPricingDto = {
  pricePerCredit?: number;
  currency?: string;
  minPurchaseCredits?: number;
  maxPurchaseCredits?: number;
  isActive?: boolean;
};

export type BillingEntitlementsDto = {
  aiCreditsMonthly?: number;
  aiCreditsUsed?: number;
  aiCreditsPurchased?: number;
};

export type BillingInvoiceReferenceDto = {
  invoice?: {
    id: BillingInvoiceIdDto;
  };
  invoiceId?: BillingInvoiceIdDto;
  id?: BillingInvoiceIdDto;
};

export type BillingChangeSubscriptionDto = BillingInvoiceReferenceDto & {
  pendingPayment?: boolean;
};

export type BillingPayInvoiceDto = {
  paymentUrl?: string;
  invoiceId?: BillingInvoiceIdDto;
};
