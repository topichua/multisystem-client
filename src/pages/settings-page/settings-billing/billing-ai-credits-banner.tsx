import { SparkleIcon } from "@phosphor-icons/react";
import { Trans, useTranslation } from "react-i18next";

import type { BillingCreditPricing } from "@/features/billing/model/billing.types";
import { formatBillingCurrencySymbol } from "@/features/billing/utils/billing-format";

import * as S from "./settings-billing.styled";

type BillingAiCreditsBannerProps = {
  creditPricing: BillingCreditPricing;
  onAdd: () => void;
  layout?: "desktop" | "mobile";
};

export const BillingAiCreditsBanner = ({
  creditPricing,
  onAdd,
  layout = "desktop",
}: BillingAiCreditsBannerProps) => {
  const { t } = useTranslation();
  const packCredits = creditPricing.minPurchaseCredits;
  const packPrice = packCredits * creditPricing.pricePerCredit;
  const currencySymbol = formatBillingCurrencySymbol(creditPricing.currency);
  const isMobile = layout === "mobile";

  return (
    <S.AiCreditsBanner $mobile={isMobile} data-qa="billing-ai-credits-banner">
      <S.AiCreditsBannerContent>
        <S.AiCreditsBannerIcon>
          <SparkleIcon size={18} weight="fill" />
        </S.AiCreditsBannerIcon>
        <S.AiCreditsBannerText>
          <S.AiCreditsBannerTitle>
            <Trans
              i18nKey="billing.aiCreditsBanner.copy"
              values={{
                credits: packCredits,
                price: packPrice,
                currency: currencySymbol,
              }}
              components={{ strong: <strong /> }}
            />
          </S.AiCreditsBannerTitle>
        </S.AiCreditsBannerText>
      </S.AiCreditsBannerContent>
      <S.MobileActionButton
        onClick={onAdd}
        data-qa="billing-ai-credits-add"
        block={isMobile}
      >
        {t("billing.aiCreditsBanner.add")}
      </S.MobileActionButton>
    </S.AiCreditsBanner>
  );
};
