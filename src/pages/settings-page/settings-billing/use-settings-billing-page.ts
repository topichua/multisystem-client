import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useUserStore } from "@/features/auth/model/use-user-store";
import type { BillingCycle } from "@/features/billing/model/billing.types";
import { useBillingStore } from "@/features/billing/model/use-billing-store";
import { consumePendingPaymentInvoiceId } from "@/features/billing/utils/billing-format";
import { useNotification } from "@/shared/components/notification/use-notification";

export function useSettingsBillingPage() {
  const { t } = useTranslation();
  const notification = useNotification();
  const userStore = useUserStore();
  const billingStore = useBillingStore();
  const paymentBlockRef = useRef<HTMLDivElement | null>(null);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const subscriptionBillingCycle = billingStore.subscription?.billingCycle;
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycle>("monthly");
  const [prevSubscriptionBillingCycle, setPrevSubscriptionBillingCycle] =
    useState(subscriptionBillingCycle);

  if (subscriptionBillingCycle !== prevSubscriptionBillingCycle) {
    setPrevSubscriptionBillingCycle(subscriptionBillingCycle);
    if (
      subscriptionBillingCycle === 'monthly' ||
      subscriptionBillingCycle === 'yearly'
    ) {
      setSelectedBillingCycle(subscriptionBillingCycle);
    }
  }

  const isOwner = userStore.isWorkspaceOwner;

  const loadPage = useCallback(async () => {
    if (!isOwner) {
      return;
    }

    await billingStore.loadBillingPage();
    await billingStore.loadEntitlements();
  }, [billingStore, isOwner]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!isOwner) {
      return;
    }

    const pendingInvoiceId = consumePendingPaymentInvoiceId();

    if (!pendingInvoiceId) {
      return;
    }

    void billingStore
      .syncPendingPayment(pendingInvoiceId)
      .then(() => userStore.loadAuth())
      .catch((error) => {
        notification.error({
          message: getApiErrorMessage(error, t("billing.errors.syncPayment")),
        });
      });
  }, [billingStore, isOwner, notification, t, userStore]);

  const scrollToPaymentBlock = useCallback(() => {
    paymentBlockRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleOpenCreditsModal = useCallback(() => {
    setCreditsModalOpen(true);
  }, []);

  const handleCloseCreditsModal = useCallback(() => {
    setCreditsModalOpen(false);
  }, []);

  const handlePurchaseCredits = useCallback(
    async (creditsAmount: number) => {
      try {
        await billingStore.purchaseCredits(creditsAmount);
        setCreditsModalOpen(false);
      } catch (error) {
        notification.error({
          message: getApiErrorMessage(error, t("billing.errors.purchaseCredits")),
        });
      }
    },
    [billingStore, notification, t],
  );

  const handlePaySubscription = useCallback(async () => {
    try {
      await billingStore.paySubscription();
    } catch (error) {
      notification.error({
        message: getApiErrorMessage(error, t("billing.errors.paySubscription")),
      });
    }
  }, [billingStore, notification, t]);

  const handlePayOpenInvoice = useCallback(
    async (invoiceId: string) => {
      try {
        await billingStore.payOpenInvoice(invoiceId);
      } catch (error) {
        notification.error({
          message: getApiErrorMessage(error, t("billing.errors.paySubscription")),
        });
      }
    },
    [billingStore, notification, t],
  );

  const handleSelectPlan = useCallback(
    async (planId: number) => {
      try {
        const result = await billingStore.changePlan(
          planId,
          selectedBillingCycle,
        );

        if (result.pendingPayment) {
          notification.success({
            message: t("billing.plans.invoiceCreated"),
          });
          scrollToPaymentBlock();
          return;
        }

        notification.success({
          message: t("billing.plans.planChanged"),
        });
        await userStore.loadAuth();
      } catch (error) {
        notification.error({
          message: getApiErrorMessage(error, t("billing.errors.changePlan")),
        });
      }
    },
    [
      billingStore,
      notification,
      scrollToPaymentBlock,
      selectedBillingCycle,
      t,
      userStore,
    ],
  );

  const handleInvoicesPageChange = useCallback(
    (page: number) => {
      billingStore.setPage(page);
    },
    [billingStore],
  );

  return {
    isOwner,
    billingStore,
    creditsModalOpen,
    paymentBlockRef,
    selectedBillingCycle,
    setSelectedBillingCycle,
    handleOpenCreditsModal,
    handleCloseCreditsModal,
    handlePurchaseCredits,
    handlePaySubscription,
    handlePayOpenInvoice,
    handleSelectPlan,
    handleInvoicesPageChange,
  };
}
