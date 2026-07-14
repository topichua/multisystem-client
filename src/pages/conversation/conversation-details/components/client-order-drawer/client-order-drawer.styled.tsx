import styled from "styled-components";

export const DrawerTitle = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DrawerHeading = styled.span`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 0;
  border-top: 1px dashed
    ${({ theme }) => theme.colors.functional.border.cardBase};

  &:first-child {
    padding-top: 0;
    border-top: 0;
  }

  .ant-segmented .ant-segmented-item-selected {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.semantic.info};
    color: ${({ theme }) => theme.colors.functional.text.heading};
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const StepBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 6px;
  background: #ebe7ff;
  color: ${({ theme }) => theme.colors.semantic.primary};
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
`;

export const SectionTitleText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const SectionCount = styled.span`
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const NoDeliveryToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const ClientPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
`;

export const ClientAvatar = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  overflow: hidden;
  border-radius: 50%;
  background: #ffabb6;
  color: #7a1f2e;
  font-size: 13px;
  font-weight: 700;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ClientCopy = styled.div`
  min-width: 0;
`;

export const ClientName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const ClientPhone = styled.div`
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const ProductLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 52px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.natural};
`;

export const EmptyProductsState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70px;
  padding: 18px 20px;
  border: 1px dashed ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const ProductCopy = styled.div`
  min-width: 0;
  flex: 1;
`;

export const ProductNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const ProductName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  min-width: 0;
`;

export const ProductMeta = styled.div`
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const ProductPrice = styled.div`
  min-width: 74px;
  text-align: right;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const QuantityStepper = styled.div`
  display: grid;
  grid-template-columns: 28px 34px 28px;
  align-items: center;
  height: 28px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const QuantityButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const QuantityValue = styled.span`
  min-width: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const FormPanel = styled.div`
  .ant-form-item {
    margin-bottom: 14px;
  }

  .ant-form-item:last-child {
    margin-bottom: 0;
  }

  .ant-form-item-label > label {
    height: auto;
    font-size: 11px;
    line-height: 1.3;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  .ant-input,
  .ant-input-number,
  .ant-select-selector {
    border-radius: 8px !important;
  }

  .ant-input-number-group-wrapper {
    width: 100%;
  }

  .ant-segmented {
    width: 100%;
    padding: 0;
    border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.functional.background.elevated};
  }

  .ant-segmented .ant-segmented-group {
    width: 100%;
  }

  .ant-segmented .ant-segmented-item {
    flex: 1;
    min-height: 32px;
    border-radius: 7px;
    color: ${({ theme }) => theme.colors.functional.text.primary};
  }

  .ant-segmented .ant-segmented-item-label {
    min-height: 32px;
    line-height: 32px;
  }

  .ant-segmented .ant-segmented-item-selected {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.semantic.info};
    color: ${({ theme }) => theme.colors.functional.text.heading};
  }

  .client-order-payment-option {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .client-order-optional-label {
    margin-left: 6px;
    text-transform: none;
    letter-spacing: 0;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  .client-order-no-delivery-alert {
    border: 1px dashed ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.functional.background.natural};
  }

  .client-order-no-delivery-alert .ant-alert-message {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
    color: ${({ theme }) => theme.colors.functional.text.heading};
  }

  .client-order-no-delivery-alert .ant-alert-description {
    font-size: 12px;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const FooterDiscount = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.natural};
`;

export const FooterDiscountLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 13px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.primary};

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const FooterDiscountInput = styled.div`
  flex: 0 0 88px;

  .ant-input-number {
    width: 100%;
  }

  .ant-input-number-group-addon {
    padding-inline: 8px;
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FooterSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.natural};
`;

export const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const SummaryDiscount = styled(SummaryRow)`
  color: ${({ theme }) => theme.colors.functional.text.success};
`;

export const SummaryTotal = styled(SummaryRow)`
  padding-top: 8px;
  border-top: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const FooterActions = styled.div`
  display: grid;
  grid-template-columns: minmax(96px, auto) 1fr;
  gap: 8px;

  .ant-btn {
    min-height: 40px;
    border-radius: 8px;
    font-weight: 600;
  }
`;
