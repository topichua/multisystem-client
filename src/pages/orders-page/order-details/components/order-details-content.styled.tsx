import { Avatar, Tag, Typography } from "antd";
import styled, { createGlobalStyle, css } from "styled-components";

type EventTone = "blue" | "green" | "gold" | "purple" | "gray";

const { Text, Title } = Typography;

export const PrintStyles = createGlobalStyle`
  .print-only {
    display: none;
  }

  @media print {
    .no-print {
      display: none !important;
    }

    body {
      background: #fff !important;
    }

    .print-content {
      display: block;
      width: 100%;
    }

    .print-card {
      box-shadow: none !important;
      border: 1px solid #e5e7eb;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-only {
      display: block !important;
    }

    [data-qa="layout-app-sider"],
    [data-qa="layout-settings-sidebar"],
    [data-qa="layout-order-details-header"] {
      display: none !important;
    }

    [data-qa="layout-settings-shell"] {
      display: block !important;
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }

    [data-qa="layout-settings-content"] {
      overflow: visible !important;
    }

    .ant-typography-copy {
      display: none !important;
    }
  }
`;

export const PrintDocumentHeader = styled.header`
  display: none;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;

  @media print {
    display: block;
  }
`;

export const PrintDocumentTitle = styled(Title)`
  && {
    margin: 0 0 8px;
    color: #111827;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.25;
  }
`;

export const PrintDocumentMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  color: #6b7280;
  font-size: 14px;
`;

export const LayoutRoot = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 24px;
  align-items: start;
  margin: 0 auto;
  max-width: 1300px;
  padding-bottom: 50px;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: none;
    align-items: stretch;
    padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
  }

  @media print {
    display: block;
    max-width: none;
    padding-bottom: 0;
  }
`;

export const MainColumn = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 767px) {
    display: contents;
    gap: 16px;
  }

  @media print {
    gap: 16px;
    margin-bottom: 16px;
  }
`;

export const SideColumn = styled.aside`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 767px) {
    display: contents;
    gap: 16px;
  }

  @media print {
    gap: 16px;
  }
`;

export const DetailsCard = styled.section`
  min-width: 0;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};

  &.section-products {
    @media (max-width: 767px) {
      order: 1;
    }
  }

  &.section-customer {
    @media (max-width: 767px) {
      order: 2;
    }
  }

  &.section-delivery {
    @media (max-width: 767px) {
      order: 3;
    }
  }

  &.section-payment {
    @media (max-width: 767px) {
      order: 4;
    }
  }

  &.section-history {
    @media (max-width: 767px) {
      order: 5;
    }
  }

  @media (max-width: 767px) {
    box-sizing: border-box;
    width: 100%;
    align-self: stretch;
    padding: 16px;
  }

  @media print {
    margin-bottom: 16px;
    padding: 20px;
    border-radius: 0;
    background: #fff;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 767px) {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    margin-bottom: 16px;
  }
`;

export const CardTitle = styled(Title)`
  && {
    margin: 0;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 600;
    line-height: 1.35;
  }
`;

export const CountBadge = styled.span`
  display: inline-flex;
  min-width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.base};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 600;
`;

export const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
`;

export const ProductRow = styled.div`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) minmax(110px, auto) minmax(
      120px,
      auto
    );
  gap: 20px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};

  &:first-child {
    padding-top: 0;
  }

  @media (max-width: 767px) {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }

  @media (max-width: 720px) {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 12px;
  }
`;

export const ProductImage = styled(Avatar)`
  && {
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.functional.background.natural};
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-weight: 600;
  }
`;

export const ProductInfo = styled.div`
  min-width: 0;
`;

export const ProductName = styled(Text)`
  && {
    display: block;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 600;
  }
`;

export const ProductMeta = styled(Text)`
  && {
    display: block;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 767px) {
      white-space: normal;
      overflow-wrap: anywhere;
    }
  }
`;

export const ProductPrice = styled.div`
  justify-self: end;
  white-space: nowrap;

  @media (max-width: 767px) {
    grid-column: 2;
    justify-self: start;
  }

  @media (max-width: 720px) {
    grid-column: 2;
    justify-self: start;
  }
`;

export const ProductTotal = styled(Text)`
  && {
    justify-self: end;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.large};
    white-space: nowrap;
  }

  @media (max-width: 767px) {
    grid-column: 2;
    justify-self: start;
  }

  @media (max-width: 720px) {
    grid-column: 2;
    justify-self: start;
  }
`;

export const TotalsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

export const DiscountText = styled(Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.success};
  }
`;

export const GrandTotalRow = styled(TotalRow)`
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const GrandTotalLabel = styled(Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 700;
  }
`;

export const GrandTotalValue = styled(GrandTotalLabel)`
  && {
    font-size: 22px;
  }
`;

export const CustomerHeader = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
`;

export const CustomerIdentity = styled.div`
  min-width: 0;
`;

export const CustomerName = styled(Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 700;
  }
`;

export const CustomerSource = styled(Text)`
  && {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const ProfileLink = styled(Typography.Link)`
  && {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 18px;
    font-weight: 600;
  }
`;

export const InfoGrid = styled.dl`
  display: grid;
  grid-template-columns: minmax(108px, 0.42fr) minmax(0, 1fr);
  gap: 14px 18px;
  margin: 0;
  width: 100%;
  min-width: 0;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 4px 0;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 4px 0;
  }
`;

export const InfoPair = styled.div`
  display: contents;
`;

export const InfoLabel = styled.dt`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const InfoValue = styled.dd`
  min-width: 0;
  margin: 0;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-weight: 500;
`;

export const MutedIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const ProviderTag = styled(Tag)`
  && {
    margin-inline-end: 0;
    border-radius: 999px;
    font-weight: 600;
  }
`;

export const TrackingPanel = styled.div`
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const TrackingLabel = styled.div`
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.functional.text.disabled};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const TrackingNumber = styled(Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 700;
    letter-spacing: 0.04em;
  }
`;

export const DeliveryStatusBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.base.blue[2]};

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
  }

  @media (max-width: 767px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const AmountDue = styled(Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 700;
  }
`;

export const HistoryList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const HistoryItem = styled.li<{ $isLast: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(150px, auto);
  gap: 16px;
  min-height: 78px;
  padding-left: 46px;

  &::before {
    position: absolute;
    top: 24px;
    bottom: -24px;
    left: 12px;
    width: 2px;
    background: ${({ theme }) => theme.colors.functional.border.split};
    content: "";

    ${({ $isLast }) =>
      $isLast &&
      css`
        display: none;
      `}
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 6px;
    min-height: 0;
    padding-left: 40px;
  }
`;

export const HistoryMarker = styled.span<{ $tone: EventTone }>`
  position: absolute;
  top: 2px;
  left: 0;
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.functional.border.split};

  &::before {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: ${({ $tone, theme }) => {
      switch ($tone) {
        case "blue":
          return theme.colors.base.blue[6];
        case "green":
          return theme.colors.base.green[6];
        case "gold":
          return theme.colors.base.orange[5];
        case "purple":
          return theme.colors.semantic.primary;
        default:
          return theme.colors.functional.text.disabled;
      }
    }};
    content: "";
  }
`;

export const HistoryContent = styled.div`
  min-width: 0;
`;

export const HistoryDescription = styled(Text)`
  && {
    display: block;
    margin-top: 10px;
    color: ${({ theme }) => theme.colors.functional.text.primary};
    font-size: ${({ theme }) => theme.fontSize.large};
    overflow-wrap: anywhere;
  }
`;

export const HistoryActor = styled(Text)`
  && {
    display: block;
    margin-top: 4px;
  }
`;

export const HistoryDate = styled(Text)`
  && {
    justify-self: end;
    white-space: nowrap;
  }

  @media (max-width: 720px) {
    justify-self: start;
  }

  @media (max-width: 767px) {
    justify-self: start;
    white-space: normal;
  }
`;

export const StatusPill = styled.span<{ $tone: EventTone }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 700;

  ${({ $tone, theme }) => {
    switch ($tone) {
      case "blue":
        return css`
          background: ${theme.colors.base.blue[2]};
          color: ${theme.colors.base.blue[7]};
        `;
      case "green":
        return css`
          background: ${theme.colors.base.green[2]};
          color: ${theme.colors.base.green[7]};
        `;
      case "gold":
        return css`
          background: ${theme.colors.base.orange[2]};
          color: ${theme.colors.base.orange[6]};
        `;
      case "purple":
        return css`
          background: ${theme.colors.brandPalette[2]};
          color: ${theme.colors.semantic.primary};
        `;
      default:
        return css`
          background: ${theme.colors.functional.background.natural};
          color: ${theme.colors.functional.text.subdued};
        `;
    }
  }}
`;

export const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
`;
