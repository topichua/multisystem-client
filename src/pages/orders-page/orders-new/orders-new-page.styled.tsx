import { Button, Card, Flex, Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const MobileRoot = styled.div.attrs(() =>
  dataQaAttrs("orders-mobile-new-page"),
)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const MobilePageHeader = styled.header`
  box-sizing: border-box;
  flex: 0 0 auto;
  min-width: 0;
  padding: 16px 16px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const MobileTitleCluster = styled.div`
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  gap: 4px;
`;

export const MobileBackButton = styled(Button)`
  && {
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    padding: 0;
    margin-inline-start: -8px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const MobilePageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    flex: 1 1 auto;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const MobileScrollRegion = styled.div`
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 16px 16px calc(32px + env(safe-area-inset-bottom, 0px));
`;

export const MobileContent = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0;
`;

export const MobileSummaryAside = styled.aside`
  min-width: 0;
  margin-top: 16px;
`;

export const Content = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 760px) 340px;
  gap: 20px;
  align-items: start;
  width: min(100%, 1120px);
  min-width: 0;
  margin: 0 auto;
  padding: 4px 0 48px;

  @media (max-width: 1023px) {
    grid-template-columns: minmax(0, 760px);
    justify-content: center;
    width: min(100%, 760px);
  }
`;

export const MainColumn = styled.div`
  min-width: 0;
`;

export const SectionCard = styled(Card)`
  && {
    margin-top: 16px;
    border-color: ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    box-shadow: ${({ theme }) => theme.shadow.cardShadow};
  }

  &:first-child {
    margin-top: 0;
  }

  && .ant-card-body {
    padding: 20px;
  }

  && .ant-form-item {
    margin-bottom: 0;
  }

  @media (max-width: 767px) {
    && .ant-card-body {
      padding: 16px;
    }
  }
`;

export const CardHeader = styled(Flex)`
  && {
    margin-bottom: 18px;
    min-width: 0;
  }

  .ant-segmented {
    flex: 0 0 auto;
  }

  .ant-segmented .ant-segmented-item-selected {
    box-shadow: inset 0 0 0 1px
      ${({ theme }) => theme.colors.functional.border.selected};
    color: ${({ theme }) => theme.colors.functional.text.heading};
  }
`;

export const ClientList = styled.div`
  min-width: 0;
  max-height: 368px;
  overflow-x: hidden;
  overflow-y: auto;
  margin-top: 8px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.functional.background.elevated};

  .ant-list-item {
    padding: 10px 12px;
    cursor: pointer;
  }

  .ant-list-item + .ant-list-item {
    border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }

  .ant-list-item:hover {
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }
`;

export const ClientListState = styled.div`
  display: flex;
  min-height: 104px;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const SelectedClientCard = styled(Flex)`
  && {
    min-width: 0;
    min-height: 66px;
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.colors.semantic.primary};
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) => theme.colors.functional.background.base};
  }
`;

export const ClientFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
  min-width: 0;

  .ant-form-item:last-child {
    grid-column: 1 / 2;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;

    .ant-form-item:last-child {
      grid-column: auto;
    }
  }
`;

export const ProductSearchContent = styled.div`
  width: min(340px, calc(100vw - 48px));
`;

export const SearchResults = styled.div`
  max-height: 248px;
  overflow-x: hidden;
  overflow-y: auto;
  margin-top: 6px;
`;

export const ProductImagePlaceholder = styled.span<{ $size: number }>`
  display: inline-flex;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  flex: 0 0 ${({ $size }) => $size}px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.base.violet[4]};
`;

export const SearchResultRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 7px 8px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.small};
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  &:disabled {
    cursor: default;
    opacity: 0.55;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: -2px;
  }
`;

export const SearchResultAction = styled.span<{
  $empty: boolean;
  $selected: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 7px;
  background: ${({ $empty, $selected, theme }) =>
    $empty || $selected
      ? "transparent"
      : theme.colors.functional.background.primary};
  color: ${({ $selected, theme }) =>
    $selected
      ? theme.colors.functional.text.success
      : theme.colors.semantic.primary};
`;

export const ProductSearchState = styled.div`
  display: flex;
  min-height: 84px;
  align-items: center;
  justify-content: center;
  padding: 12px;
`;

export const ProductLines = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  margin-top: 20px;
`;

export const ProductLineBlock = styled.div`
  min-width: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};

  &:first-child {
    border-top: 0;
  }
`;

export const ProductLine = styled.div`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 90px 92px 32px 32px;
  align-items: center;
  gap: 14px;
  min-width: 0;
  min-height: 64px;
  padding: 10px 0;

  @media (max-width: 767px) {
    grid-template-columns: 42px minmax(0, 1fr) auto auto auto;
    grid-template-rows: auto auto;
    row-gap: 10px;
    column-gap: 8px;
    min-height: 0;
    padding: 12px 0;

    & > :nth-child(1) {
      grid-row: 1 / 3;
      align-self: start;
    }

    & > :nth-child(2) {
      grid-column: 2 / 6;
    }

    & > :nth-child(3) {
      grid-column: 2;
      justify-self: start;
    }

    & > :nth-child(4) {
      grid-column: 3;
      justify-self: end;
    }

    & > :nth-child(5) {
      grid-column: 4;
    }

    & > :nth-child(6) {
      grid-column: 5;
    }
  }
`;

export const LineDiscountRow = styled(Flex)`
  && {
    min-width: 0;
    margin-bottom: 10px;
    padding: 12px;
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) => theme.colors.functional.background.base};
  }

  .ant-input-number-group-wrapper {
    width: 120px;
    flex: 0 0 120px;
  }

  @media (max-width: 767px) {
    && {
      flex-wrap: wrap;
    }

    .ant-input-number-group-wrapper {
      width: 100%;
      flex: 1 1 100%;
    }
  }
`;

export const DeliveryFormPanel = styled.div`
  .ant-input,
  .ant-input-number,
  .ant-select-selector {
    border-radius: ${({ theme }) => theme.radius.medium};
  }

  .ant-input,
  .ant-select-selector {
    min-height: 40px;
  }

  .ant-input-number-group-wrapper {
    width: 100%;
  }

  .ant-segmented {
    width: 100%;
    padding: 0;
    border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) => theme.colors.functional.background.elevated};
  }

  .ant-segmented .ant-segmented-group {
    width: 100%;
  }

  .ant-segmented .ant-segmented-item {
    flex: 1;
    min-height: 34px;
    border-radius: 7px;
    color: ${({ theme }) => theme.colors.functional.text.primary};
  }

  .ant-segmented .ant-segmented-item-label {
    min-height: 34px;
    line-height: 34px;
  }

  .ant-segmented .ant-segmented-item-selected {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.semantic.info};
    color: ${({ theme }) => theme.colors.functional.text.heading};
  }

  .client-order-no-delivery-alert {
    margin-bottom: 14px;
    border: 1px dashed ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) => theme.colors.functional.background.natural};
  }

  .client-order-no-delivery-alert .ant-alert-message {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: 700;
    line-height: 1.35;
  }

  .client-order-no-delivery-alert .ant-alert-description {
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    line-height: 1.45;
  }
`;

export const DeliveryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

export const PaymentFormPanel = styled.div`
  .ant-form-item {
    margin: 14px 0 0;
  }

  .ant-input-number,
  .ant-input-number-group-addon {
    border-radius: ${({ theme }) => theme.radius.medium};
  }

  .ant-input-number-group-wrapper {
    width: 100%;
  }

  .ant-segmented {
    width: 100%;
    padding: 0;
    border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) => theme.colors.functional.background.elevated};
  }

  .ant-segmented .ant-segmented-group {
    width: 100%;
  }

  .ant-segmented .ant-segmented-item {
    flex: 1;
    min-height: 34px;
    border-radius: 7px;
    color: ${({ theme }) => theme.colors.functional.text.primary};
  }

  .ant-segmented .ant-segmented-item-label {
    min-height: 34px;
    line-height: 34px;
  }

  .ant-segmented .ant-segmented-item-selected {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.semantic.info};
    color: ${({ theme }) => theme.colors.functional.text.heading};
  }
`;

export const ShipmentParamsBody = styled.div`
  margin-top: 16px;

  .ant-input-number,
  .ant-input-number-group-addon {
    border-radius: ${({ theme }) => theme.radius.medium};
  }

  .ant-space-compact {
    width: 100%;
  }
`;

export const ShipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

export const SummaryAside = styled.aside`
  position: sticky;
  top: 4px;
  min-width: 0;

  @media (max-width: 1023px) {
    position: static;
  }
`;

export const SummaryCard = styled(Card)`
  && {
    border-color: ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    box-shadow: ${({ theme }) => theme.shadow.cardShadow};
  }

  && .ant-card-body {
    padding: 18px 20px 20px;
  }

  .ant-select {
    width: 100%;
  }

  .ant-select-selector {
    min-height: 40px;
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) =>
      theme.colors.functional.background.base} !important;
  }

  .ant-input-number,
  .ant-input-number-group-addon {
    border-radius: ${({ theme }) => theme.radius.medium};
  }
`;

export const SummaryStatusNote = styled(Flex)`
  && {
    min-height: 38px;
    margin-top: 14px;
    padding: 9px 12px;
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) => theme.colors.functional.background.base};
  }
`;
