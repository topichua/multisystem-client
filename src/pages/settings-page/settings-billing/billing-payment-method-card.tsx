import { useTranslation } from "react-i18next";

import type {
  BillingInvoice,
  BillingPlan,
  BillingSubscription,
} from "@/features/billing/model/billing.types";
import {
  getBillingPaymentButtonState,
  isFreeSubscriptionPlan,
} from "@/features/billing/utils/billing-payment";

import { MonobankLogoMark } from "./monobank-logo";
import * as S from "./settings-billing.styled";

type BillingPaymentMethodCardProps = {
  subscription: BillingSubscription;
  invoices: BillingInvoice[];
  plans: BillingPlan[];
  payLoading: boolean;
  onPay: () => void;
  layout?: "desktop" | "mobile";
};

export const BillingPaymentMethodCard = ({
  subscription,
  invoices,
  plans,
  payLoading,
  onPay,
  layout = "desktop",
}: BillingPaymentMethodCardProps) => {
  const { t } = useTranslation();
  const isMobile = layout === "mobile";
  const buttonState = getBillingPaymentButtonState(subscription, invoices, {
    isFreePlan: isFreeSubscriptionPlan(subscription, plans),
  });

  return (
    <S.BillingCard data-qa="billing-payment-method-card">
      <S.PaymentMethodRow>
        <S.PaymentMethodIdentity>
          <MonobankLogoMark />
          <S.PaymentMethodText>
            <S.PaymentMethodTitle>
              {t("billing.paymentMethod.title")}
            </S.PaymentMethodTitle>
            <S.PaymentMethodSubtitle>
              {t("billing.paymentMethod.subtitle")}
            </S.PaymentMethodSubtitle>
            {buttonState.helperKey ? (
              <S.PaidUntilText>
                {t(buttonState.helperKey, buttonState.helperValues)}
              </S.PaidUntilText>
            ) : null}
          </S.PaymentMethodText>
        </S.PaymentMethodIdentity>
        <S.MobileActionButton
          onClick={onPay}
          loading={payLoading}
          disabled={!buttonState.enabled}
          data-qa="billing-pay-subscription"
          block={isMobile}
        >
          {t(buttonState.labelKey)}
        </S.MobileActionButton>
      </S.PaymentMethodRow>
    </S.BillingCard>
  );
};
