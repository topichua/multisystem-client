import { Result, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { BillingAiCreditsBanner } from "./billing-ai-credits-banner";
import { BillingCreditsPurchaseModal } from "./billing-credits-purchase-modal";
import { BillingCurrentPlanCard } from "./billing-current-plan-card";
import { BillingInfoBar } from "./billing-info-bar";
import { BillingPaymentHistoryTable } from "./billing-payment-history-table";
import { BillingPaymentMethodCard } from "./billing-payment-method-card";
import { BillingPlansSection } from "./billing-plans-section";
import type { BillingLayout } from "./settings-billing.styled";
import * as S from "./settings-billing.styled";
import { useSettingsBillingPage } from "./use-settings-billing-page";

const { Text } = Typography;

type SettingsBillingContentProps = {
  layout?: BillingLayout;
};

export const SettingsBillingContent = observer(
  ({ layout = "desktop" }: SettingsBillingContentProps) => {
    const { t } = useTranslation();
    const isMobile = layout === "mobile";
    const {
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
    } = useSettingsBillingPage();

    if (!isOwner) {
      return (
        <S.BillingPageRoot>
          <S.AccessDeniedCard data-qa="billing-access-denied">
            <Result
              status="403"
              title={t("billing.accessDenied.title")}
              subTitle={t("billing.accessDenied.description")}
            />
          </S.AccessDeniedCard>
        </S.BillingPageRoot>
      );
    }

    const creditPricing = billingStore.creditPricing;
    const showAiCreditsBanner = creditPricing?.isActive === true;
    const subscription = billingStore.subscription;

    return (
      <S.BillingPageRoot>
        <Spin
          spinning={billingStore.pageLoading || billingStore.syncPaymentLoading}
        >
          <S.BillingStack $mobile={isMobile} data-qa="billing-page-content">
            {billingStore.pageError && (
              <Text type="danger">{billingStore.pageError}</Text>
            )}

            <BillingInfoBar />

            {subscription && (
              <BillingCurrentPlanCard
                subscription={subscription}
                layout={layout}
              />
            )}

            {subscription && (
              <BillingPlansSection
                plans={billingStore.plans}
                subscription={subscription}
                selectedBillingCycle={selectedBillingCycle}
                changingPlanId={billingStore.changingPlanId}
                layout={layout}
                onBillingCycleChange={setSelectedBillingCycle}
                onSelectPlan={handleSelectPlan}
              />
            )}

            {showAiCreditsBanner && creditPricing && (
              <BillingAiCreditsBanner
                creditPricing={creditPricing}
                onAdd={handleOpenCreditsModal}
                layout={layout}
              />
            )}

            <S.PaymentBlockAnchor ref={paymentBlockRef}>
              {subscription && (
                <BillingPaymentMethodCard
                  subscription={subscription}
                  invoices={billingStore.invoices}
                  plans={billingStore.plans}
                  payLoading={billingStore.subscriptionPaymentLoading}
                  onPay={handlePaySubscription}
                  layout={layout}
                />
              )}
            </S.PaymentBlockAnchor>

            <BillingPaymentHistoryTable
              invoices={billingStore.invoices}
              total={billingStore.total}
              page={billingStore.page}
              pageSize={billingStore.pageSize}
              loading={billingStore.pageLoading}
              payingInvoiceId={billingStore.payingInvoiceId}
              layout={layout}
              onPageChange={handleInvoicesPageChange}
              onPayInvoice={handlePayOpenInvoice}
            />
          </S.BillingStack>

          {billingStore.creditPricing && (
            <BillingCreditsPurchaseModal
              open={creditsModalOpen}
              creditPricing={billingStore.creditPricing}
              confirmLoading={billingStore.creditsPurchaseLoading}
              onCancel={handleCloseCreditsModal}
              onConfirm={handlePurchaseCredits}
            />
          )}
        </Spin>
      </S.BillingPageRoot>
    );
  },
);
