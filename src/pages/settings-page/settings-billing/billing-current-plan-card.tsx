import { useTranslation } from "react-i18next";

import type { BillingSubscription } from "@/features/billing/model/billing.types";
import { formatBillingDate } from "@/features/billing/utils/billing-format";

import * as S from "./settings-billing.styled";
import type { BillingLayout } from "./settings-billing.styled";

type BillingCurrentPlanCardProps = {
  subscription: BillingSubscription;
  layout?: BillingLayout;
};

function getStatusVariant(
  status: BillingSubscription["status"],
): "active" | "trial" | "past_due" | "default" {
  if (status === "active" || status === "trial" || status === "past_due") {
    return status;
  }

  return "default";
}

export const BillingCurrentPlanCard = ({
  subscription,
  layout = "desktop",
}: BillingCurrentPlanCardProps) => {
  const { t } = useTranslation();
  const isMobile = layout === "mobile";
  const planName =
    subscription.plan?.name ?? t("billing.currentPlan.unknownPlan");
  const periodEnd = subscription.periodEnd ?? subscription.paidUntil;
  const status = subscription.status ?? "active";
  const statusVariant = getStatusVariant(status);

  return (
    <S.CurrentPlanCard $mobile={isMobile} data-qa="billing-current-plan-card">
      <S.CurrentPlanMain>
        <S.CurrentPlanTitleRow>
          <S.CurrentPlanName>{planName}</S.CurrentPlanName>
          <S.SubscriptionStatusBadge $variant={statusVariant}>
            {t(`billing.subscriptionStatus.${status}`, {
              defaultValue: t("billing.subscriptionStatus.active"),
            })}
          </S.SubscriptionStatusBadge>
        </S.CurrentPlanTitleRow>

        {periodEnd && (
          <S.CurrentPlanMeta>
            {t("billing.currentPlan.validUntil", {
              date: formatBillingDate(periodEnd),
            })}
          </S.CurrentPlanMeta>
        )}

        <S.CurrentPlanMeta>
          {t("billing.currentPlan.manualRenewal")}
        </S.CurrentPlanMeta>

        {subscription.isExpired && (
          <S.ExpiredWarning>
            {t("billing.currentPlan.expiredWarning")}
          </S.ExpiredWarning>
        )}
      </S.CurrentPlanMain>
    </S.CurrentPlanCard>
  );
};
