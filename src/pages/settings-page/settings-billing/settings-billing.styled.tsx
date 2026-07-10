import { Button, Typography } from "antd";
import styled, { css } from "styled-components";

export type BillingLayout = "desktop" | "mobile";

export const BillingPageRoot = styled.div`
  box-sizing: border-box;
  width: 100%;
`;

export const BillingStack = styled.div<{ $mobile?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $mobile }) => ($mobile ? 12 : 16)}px;
  width: 100%;
  max-width: ${({ $mobile }) => ($mobile ? "none" : "860px")};
  margin: 0 auto;
`;

export const AiCreditsBanner = styled.div<{ $mobile?: boolean }>`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: ${({ $mobile }) => ($mobile ? "14px 16px" : "16px 20px")};
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.promotion};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.primary};

  ${({ $mobile }) =>
    $mobile &&
    css`
      flex-direction: column;
      align-items: stretch;
    `}
`;

export const AiCreditsBannerContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
`;

export const AiCreditsBannerIcon = styled.span`
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.base.violet[6]};
  color: #fff;

  svg {
    display: block;
  }
`;

export const AiCreditsBannerText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const AiCreditsBannerTitle = styled(Typography.Text)`
  && {
    font-size: ${({ theme }) => theme.fontSize.base};
    color: ${({ theme }) => theme.colors.functional.text.heading};
    line-height: 1.4;
  }
`;

export const BillingCard = styled.div<{ $mobile?: boolean }>`
  box-sizing: border-box;
  padding: ${({ $mobile }) => ($mobile ? "16px" : "20px 24px")};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;

export const PaymentMethodRow = styled.div<{ $mobile?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  ${({ $mobile }) =>
    $mobile &&
    css`
      flex-direction: column;
      align-items: stretch;
    `}
`;

export const PaymentMethodIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
`;

export const PaymentMethodText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const PaymentMethodTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const PaymentMethodSubtitle = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const HistoryCard = styled(BillingCard)`
  padding: 0;
  overflow: hidden;
`;

export const HistoryHeader = styled.div<{ $mobile?: boolean }>`
  padding: ${({ $mobile }) => ($mobile ? "16px 16px 0" : "20px 24px 0")};
`;

export const HistoryTitle = styled(Typography.Title)`
  && {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 600;
  }
`;

export const HistoryTableWrap = styled.div`
  padding: 8px 8px 0;

  .ant-table {
    background: transparent;
  }

  .ant-table-thead > tr > th {
    background: transparent;
    font-size: ${({ theme }) => theme.fontSize.xSmall};
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    border-bottom: 1px solid
      ${({ theme }) => theme.colors.functional.border.split};

    &::before {
      display: none;
    }
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid
      ${({ theme }) => theme.colors.functional.border.split};
  }
`;

export const InvoiceNumber = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const StatusBadge = styled.span<{
  $variant: "paid" | "open" | "void" | "refunded";
}>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case "paid":
        return `
          color: ${theme.colors.functional.text.success};
          background: ${theme.colors.functional.background.success};
        `;
      case "open":
        return `
          color: ${theme.colors.functional.text.warning};
          background: ${theme.colors.functional.background.warning};
        `;
      default:
        return `
          color: ${theme.colors.functional.text.subdued};
          background: ${theme.colors.functional.background.natural};
        `;
    }
  }}
`;

export const PaidUntilText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const MonobankLogo = styled.div`
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 48px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: #000;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: lowercase;
`;

export const AccessDeniedCard = styled(BillingCard)`
  text-align: center;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
`;

export const MobileActionButton = styled(Button)`
  && {
    flex-shrink: 0;
  }
`;

export const InfoBar = styled.div`
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.natural};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  line-height: 1.45;
`;

export const CurrentPlanCard = styled(BillingCard)<{ $mobile?: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const CurrentPlanMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const CurrentPlanTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const CurrentPlanName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const SubscriptionStatusBadge = styled.span<{
  $variant: "active" | "trial" | "past_due" | "default";
}>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 500;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case "active":
        return `
          color: ${theme.colors.functional.text.success};
          background: ${theme.colors.functional.background.success};
        `;
      case "trial":
        return `
          color: ${theme.colors.semantic.upgrade};
          background: ${theme.colors.functional.background.promotion};
        `;
      case "past_due":
        return `
          color: ${theme.colors.functional.text.error};
          background: ${theme.colors.functional.background.error};
        `;
      default:
        return `
          color: ${theme.colors.functional.text.subdued};
          background: ${theme.colors.functional.background.natural};
        `;
    }
  }}
`;

export const CurrentPlanMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  line-height: 1.45;
`;

export const ExpiredWarning = styled.div`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.base.volcano[7]};
`;

export const BillingCycleToggleWrap = styled.div<{ $mobile?: boolean }>`
  display: flex;
  justify-content: ${({ $mobile }) => ($mobile ? "stretch" : "center")};
  width: 100%;
`;

export const BillingCycleToggle = styled.div<{ $mobile?: boolean }>`
  display: inline-flex;
  width: ${({ $mobile }) => ($mobile ? "100%" : "auto")};
  padding: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.natural};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const BillingCycleOption = styled.button<{
  $active?: boolean;
  $mobile?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: ${({ $mobile }) => ($mobile ? "1 1 0" : "0 0 auto")};
  gap: 8px;
  min-width: 0;
  flex-wrap: ${({ $mobile }) => ($mobile ? "wrap" : "nowrap")};
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.functional.background.elevated : "transparent"};
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 2px rgba(0, 0, 0, 0.06)" : "none"};
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 500;
  cursor: pointer;
`;

export const DiscountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.success};
  color: ${({ theme }) => theme.colors.functional.text.success};
  font-size: ${({ theme }) => theme.fontSize.xSmall};
  font-weight: 600;
`;

export const PlansGrid = styled.div<{ $mobile?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $mobile }) =>
    $mobile ? "1fr" : "repeat(3, minmax(0, 1fr))"};
  gap: ${({ $mobile }) => ($mobile ? 12 : 16)}px;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`;

export const PlanCard = styled(BillingCard)<{
  $highlighted?: boolean;
  $mobile?: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  position: relative;
  border-color: ${({ $highlighted, theme }) =>
    $highlighted
      ? theme.colors.base.violet[4]
      : theme.colors.functional.border.cardBase};
  box-shadow: ${({ $highlighted }) =>
    $highlighted ? "0 8px 24px rgba(88, 56, 255, 0.08)" : "none"};
`;

export const PlanPopularBadge = styled.span`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 2px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.promotion};
  color: ${({ theme }) => theme.colors.semantic.upgrade};
  font-size: ${({ theme }) => theme.fontSize.xSmall};
  font-weight: 600;
`;

export const PlanName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const PlanPriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

export const PlanPrice = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  line-height: 1;
`;

export const PlanPricePeriod = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const PlanFeatures = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 auto;
`;

export const PlanFeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.heading};
  line-height: 1.4;

  &::before {
    content: "✓";
    color: ${({ theme }) => theme.colors.base.green[6]};
    font-weight: 700;
  }
`;

export const PlanCtaButton = styled(Button)`
  && {
    margin-top: auto;
  }
`;

export const PaymentBlockAnchor = styled.div`
  scroll-margin-top: 24px;
`;

export const HistoryMobileList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const HistoryMobileItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};

  &:first-child {
    border-top: 0;
  }
`;

export const HistoryMobileItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const HistoryMobileItemMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const HistoryMobileItemDate = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const HistoryMobileItemTariff = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.heading};
  line-height: 1.35;
`;

export const HistoryMobileItemFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const HistoryMobileAmount = styled.span`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const HistoryMobilePagination = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 16px 16px;
`;

export const HistoryMobileEmpty = styled.div`
  padding: 24px 16px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

