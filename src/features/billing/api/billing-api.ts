import { apiClient } from "@/api/api-client";

import type {
  BillingChangeSubscriptionResponse,
  BillingCreditPricing,
  BillingCreditsPurchaseResponse,
  BillingCycle,
  BillingEntitlements,
  BillingInvoice,
  BillingInvoicesListResponse,
  BillingPayInvoiceResponse,
  BillingPlan,
  BillingSubscription,
} from "@/features/billing/model/billing.types";

import type {
  BillingChangeSubscriptionDto,
  BillingCreditPricingDto,
  BillingEntitlementsDto,
  BillingInvoiceDto,
  BillingInvoiceReferenceDto,
  BillingInvoicesListDto,
  BillingPayInvoiceDto,
  BillingPlansDto,
  BillingSubscriptionDto,
} from "./billing-api.dtos";
import {
  normalizeBillingChangeSubscription,
  normalizeBillingCreditPricing,
  normalizeBillingEntitlements,
  normalizeBillingInvoice,
  normalizeBillingInvoicesList,
  normalizeBillingPayInvoiceResponse,
  normalizeBillingPlans,
  normalizeBillingSubscription,
  normalizeInvoiceReference,
} from "./billing-api.utils";

const workspaceBillingPath = "/workspace/billing";

export const billingApi = {
  getCreditPricing: async (): Promise<BillingCreditPricing> => {
    const { data } = await apiClient.get<BillingCreditPricingDto>(
      "/billing/credit-pricing",
    );
    return normalizeBillingCreditPricing(data);
  },

  getPlans: async (): Promise<BillingPlan[]> => {
    const { data } = await apiClient.get<BillingPlansDto>("/billing/plans");
    return normalizeBillingPlans(data);
  },

  getEntitlements: async (): Promise<BillingEntitlements> => {
    const { data } = await apiClient.get<BillingEntitlementsDto>(
      `${workspaceBillingPath}/entitlements`,
    );
    return normalizeBillingEntitlements(data);
  },

  getSubscription: async (): Promise<BillingSubscription> => {
    const { data } = await apiClient.get<BillingSubscriptionDto>(
      `${workspaceBillingPath}/subscription`,
    );
    return normalizeBillingSubscription(data);
  },

  listInvoices: async (
    params: {
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<BillingInvoicesListResponse> => {
    const { data } = await apiClient.get<BillingInvoicesListDto>(
      `${workspaceBillingPath}/invoices`,
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      },
    );
    return normalizeBillingInvoicesList(data);
  },

  purchaseCredits: async (
    creditsAmount: number,
  ): Promise<BillingCreditsPurchaseResponse> => {
    const { data } = await apiClient.post<BillingInvoiceReferenceDto>(
      `${workspaceBillingPath}/credits/purchase`,
      { creditsAmount },
    );

    return { invoice: normalizeInvoiceReference(data) };
  },

  renewSubscription: async (): Promise<BillingCreditsPurchaseResponse> => {
    const { data } = await apiClient.post<BillingInvoiceReferenceDto>(
      `${workspaceBillingPath}/subscription/renew`,
    );

    return { invoice: normalizeInvoiceReference(data) };
  },

  changeSubscription: async (payload: {
    planTemplateId: number;
    billingCycle: BillingCycle;
  }): Promise<BillingChangeSubscriptionResponse> => {
    const { data } = await apiClient.post<BillingChangeSubscriptionDto>(
      `${workspaceBillingPath}/subscription/change`,
      payload,
    );

    return normalizeBillingChangeSubscription(data);
  },

  payInvoice: async (invoiceId: string): Promise<BillingPayInvoiceResponse> => {
    const normalizedInvoiceId = invoiceId.trim();

    if (!normalizedInvoiceId) {
      throw new Error("Missing invoice id");
    }

    const { data } = await apiClient.post<BillingPayInvoiceDto>(
      `${workspaceBillingPath}/invoices/${normalizedInvoiceId}/pay`,
    );

    return normalizeBillingPayInvoiceResponse(data, normalizedInvoiceId);
  },

  syncPayment: async (invoiceId: string): Promise<void> => {
    await apiClient.post(
      `${workspaceBillingPath}/invoices/${invoiceId}/sync-payment`,
    );
  },

  getInvoice: async (invoiceId: string): Promise<BillingInvoice> => {
    const { data } = await apiClient.get<BillingInvoiceDto>(
      `${workspaceBillingPath}/invoices/${invoiceId}`,
    );
    return normalizeBillingInvoice(data);
  },
};
