import { makeAutoObservable, runInAction } from "mobx";

import { billingApi } from "@/features/billing/api/billing-api";
import type {
  BillingCreditPricing,
  BillingCycle,
  BillingEntitlements,
  BillingInvoice,
  BillingPlan,
  BillingSubscription,
} from "@/features/billing/model/billing.types";
import { redirectToPayment } from "@/features/billing/utils/billing-format";
import { resolvePayableInvoice } from "@/features/billing/utils/billing-payment";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

export class BillingStore {
  plans: BillingPlan[] = [];
  creditPricing: BillingCreditPricing | null = null;
  subscription: BillingSubscription | null = null;
  entitlements: BillingEntitlements | null = null;
  invoices: BillingInvoice[] = [];
  total = 0;
  page = 1;
  pageSize = 20;

  pageLoading = false;
  pageError: string | null = null;

  creditsPurchaseLoading = false;
  subscriptionPaymentLoading = false;
  syncPaymentLoading = false;
  changingPlanId: number | null = null;
  payingInvoiceId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get defaultCreditPackAmount(): number {
    return this.creditPricing?.minPurchaseCredits ?? 0;
  }

  get defaultCreditPackPrice(): number {
    if (!this.creditPricing) {
      return 0;
    }

    return this.defaultCreditPackAmount * this.creditPricing.pricePerCredit;
  }

  loadBillingPage = async (): Promise<void> => {
    runInAction(() => {
      this.pageLoading = true;
      this.pageError = null;
    });

    try {
      const [plans, creditPricing, subscription, invoicesResponse] =
        await Promise.all([
          billingApi.getPlans(),
          billingApi.getCreditPricing(),
          billingApi.getSubscription(),
          billingApi.listInvoices({ page: this.page, pageSize: this.pageSize }),
        ]);

      runInAction(() => {
        this.plans = plans;
        this.creditPricing = creditPricing;
        this.subscription = subscription;
        this.invoices = invoicesResponse.items;
        this.total = invoicesResponse.total;
        this.page = invoicesResponse.page;
        this.pageSize = invoicesResponse.pageSize;
        this.pageError = null;
      });
    } catch (error) {
      runInAction(() => {
        this.pageError = unknownErrorMessage(error);
      });
      throwLoadError("Failed to load billing page", error);
    } finally {
      runInAction(() => {
        this.pageLoading = false;
      });
    }
  };

  loadEntitlements = async (): Promise<void> => {
    try {
      const entitlements = await billingApi.getEntitlements();
      runInAction(() => {
        this.entitlements = entitlements;
      });
    } catch (error) {
      throwLoadError("Failed to load billing entitlements", error);
    }
  };

  refreshBillingData = async (): Promise<void> => {
    const [plans, subscription, invoicesResponse] = await Promise.all([
      billingApi.getPlans(),
      billingApi.getSubscription(),
      billingApi.listInvoices({ page: this.page, pageSize: this.pageSize }),
      this.loadEntitlements(),
    ]);

    runInAction(() => {
      this.plans = plans;
      this.subscription = subscription;
      this.invoices = invoicesResponse.items;
      this.total = invoicesResponse.total;
      this.page = invoicesResponse.page;
      this.pageSize = invoicesResponse.pageSize;
    });
  };

  refreshAfterPayment = async (): Promise<void> => {
    await this.refreshBillingData();
  };

  setPage = (page: number): void => {
    this.page = page;
    void this.loadInvoices();
  };

  loadInvoices = async (): Promise<void> => {
    try {
      const response = await billingApi.listInvoices({
        page: this.page,
        pageSize: this.pageSize,
      });

      runInAction(() => {
        this.invoices = response.items;
        this.total = response.total;
        this.page = response.page;
        this.pageSize = response.pageSize;
      });
    } catch (error) {
      throwLoadError("Failed to load billing invoices", error);
    }
  };

  changePlan = async (
    planTemplateId: number,
    billingCycle: BillingCycle,
  ): Promise<{ pendingPayment: boolean; invoiceId: string | null }> => {
    runInAction(() => {
      this.changingPlanId = planTemplateId;
    });

    try {
      const result = await billingApi.changeSubscription({
        planTemplateId,
        billingCycle,
      });

      await this.refreshBillingData();

      return {
        pendingPayment: result.pendingPayment,
        invoiceId: result.invoice?.id ?? null,
      };
    } finally {
      runInAction(() => {
        this.changingPlanId = null;
      });
    }
  };

  purchaseCredits = async (creditsAmount: number): Promise<void> => {
    runInAction(() => {
      this.creditsPurchaseLoading = true;
    });

    try {
      const { invoice } = await billingApi.purchaseCredits(creditsAmount);

      if (!invoice.id) {
        throw new Error("Missing invoice id");
      }

      await this.payInvoice(invoice.id);
    } finally {
      runInAction(() => {
        this.creditsPurchaseLoading = false;
      });
    }
  };

  paySubscription = async (): Promise<void> => {
    const subscription = this.subscription;

    if (!subscription) {
      return;
    }

    runInAction(() => {
      this.subscriptionPaymentLoading = true;
    });

    try {
      const payable = resolvePayableInvoice(subscription, this.invoices);

      if (payable?.id) {
        await this.payInvoice(payable.id);
        return;
      }

      if (subscription.canRenew && subscription.isExpired) {
        const { invoice } = await billingApi.renewSubscription();

        if (!invoice.id) {
          throw new Error("Missing invoice id");
        }

        await this.payInvoice(invoice.id);
      }
    } finally {
      runInAction(() => {
        this.subscriptionPaymentLoading = false;
      });
    }
  };

  payOpenInvoice = async (invoiceId: string): Promise<void> => {
    runInAction(() => {
      this.payingInvoiceId = invoiceId;
    });

    try {
      await this.payInvoice(invoiceId);
    } finally {
      runInAction(() => {
        this.payingInvoiceId = null;
      });
    }
  };

  payInvoice = async (invoiceId: string): Promise<void> => {
    const normalizedInvoiceId = invoiceId.trim();

    if (!normalizedInvoiceId) {
      throw new Error("Missing invoice id");
    }

    const { paymentUrl, invoiceId: resolvedInvoiceId } =
      await billingApi.payInvoice(normalizedInvoiceId);

    if (!paymentUrl) {
      throw new Error("Missing payment URL");
    }

    redirectToPayment(paymentUrl, resolvedInvoiceId || normalizedInvoiceId);
  };

  syncPendingPayment = async (invoiceId: string): Promise<void> => {
    runInAction(() => {
      this.syncPaymentLoading = true;
    });

    try {
      await billingApi.syncPayment(invoiceId);
      await this.refreshAfterPayment();
    } finally {
      runInAction(() => {
        this.syncPaymentLoading = false;
      });
    }
  };
}
