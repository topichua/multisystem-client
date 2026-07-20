import { useTranslation } from "react-i18next";

import type {
  BillingCycle,
  BillingPlan,
  BillingSubscription,
} from "@/features/billing/model/billing.types";
import {
  formatBillingCurrencySymbol,
  formatPlanPriceValue,
} from "@/features/billing/utils/billing-format";
import {
  getMaxYearlyDiscountPercent,
  getPlanCta,
  getPlanFeatures,
  getPlanPrice,
  getPublicPlans,
  isCurrentPlan,
} from "@/features/billing/utils/billing-payment";

import * as S from "./settings-billing.styled";
import type { BillingLayout } from "./settings-billing.styled";

type BillingPlansSectionProps = {
  plans: BillingPlan[];
  subscription: BillingSubscription;
  selectedBillingCycle: BillingCycle;
  changingPlanId: number | null;
  layout?: BillingLayout;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  onSelectPlan: (planId: number) => void;
};

export const BillingPlansSection = ({
  plans,
  subscription,
  selectedBillingCycle,
  changingPlanId,
  layout = "desktop",
  onBillingCycleChange,
  onSelectPlan,
}: BillingPlansSectionProps) => {
  const { t } = useTranslation();
  const isMobile = layout === "mobile";
  const publicPlans = getPublicPlans(plans);
  const yearlyDiscount = getMaxYearlyDiscountPercent(publicPlans);

  if (publicPlans.length === 0) {
    return null;
  }

  return (
    <div data-qa="billing-plans-section">
      <S.BillingCycleToggleWrap $mobile={isMobile}>
        <S.BillingCycleToggle $mobile={isMobile}>
          <S.BillingCycleOption
            type="button"
            $active={selectedBillingCycle === "monthly"}
            $mobile={isMobile}
            onClick={() => onBillingCycleChange("monthly")}
            data-qa="billing-cycle-monthly"
          >
            {t("billing.plans.cycleMonthly")}
          </S.BillingCycleOption>
          <S.BillingCycleOption
            type="button"
            $active={selectedBillingCycle === "yearly"}
            $mobile={isMobile}
            onClick={() => onBillingCycleChange("yearly")}
            data-qa="billing-cycle-yearly"
          >
            {t("billing.plans.cycleYearly")}
            {yearlyDiscount > 0 && (
              <S.DiscountBadge>
                {t("billing.plans.yearlyDiscount", { percent: yearlyDiscount })}
              </S.DiscountBadge>
            )}
          </S.BillingCycleOption>
        </S.BillingCycleToggle>
      </S.BillingCycleToggleWrap>

      <S.PlansGrid $mobile={isMobile} style={{ marginTop: isMobile ? 12 : 16 }}>
        {publicPlans.map((plan) => {
          const price = getPlanPrice(plan, selectedBillingCycle);
          const currencySymbol = formatBillingCurrencySymbol(plan.currency);
          const features = getPlanFeatures(plan.entitlements, t);
          const cta = getPlanCta(subscription, plan, selectedBillingCycle, t);
          const highlighted = plan.slug === "pro";
          const current = isCurrentPlan(
            subscription,
            plan,
            selectedBillingCycle,
          );

          return (
            <S.PlanCard
              key={plan.id}
              $highlighted={highlighted}
              $mobile={isMobile}
              data-qa={`billing-plan-card-${plan.slug}`}
            >
              {highlighted && (
                <S.PlanPopularBadge>
                  {t("billing.plans.popular")}
                </S.PlanPopularBadge>
              )}

              <S.PlanName>{plan.name}</S.PlanName>

              <S.PlanPriceRow>
                <S.PlanPrice>
                  {currencySymbol}
                  {formatPlanPriceValue(price)}
                </S.PlanPrice>
                <S.PlanPricePeriod>
                  {selectedBillingCycle === "yearly"
                    ? t("billing.plans.perYear")
                    : t("billing.plans.perMonth")}
                </S.PlanPricePeriod>
              </S.PlanPriceRow>

              <S.PlanFeatures>
                {features.map((feature) => (
                  <S.PlanFeatureItem key={feature.key}>
                    {feature.label}
                  </S.PlanFeatureItem>
                ))}
              </S.PlanFeatures>

              <S.PlanCtaButton
                type={current ? "default" : "primary"}
                block
                disabled={cta.disabled}
                loading={changingPlanId === plan.id}
                onClick={() => onSelectPlan(plan.id)}
                data-qa={`billing-plan-cta-${plan.slug}`}
              >
                {cta.label}
              </S.PlanCtaButton>
            </S.PlanCard>
          );
        })}
      </S.PlansGrid>
    </div>
  );
};
