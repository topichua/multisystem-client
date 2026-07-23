import { Timeline as AntdTimeline, Avatar, Typography } from "antd";
import styled, { createGlobalStyle } from "styled-components";

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

export const ProductRow = styled.div<{ $compact?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $compact }) =>
    $compact
      ? "48px minmax(0, 1fr) auto"
      : "64px minmax(0, 1fr) minmax(110px, auto) minmax(120px, auto)"};
  gap: ${({ $compact }) => ($compact ? "0" : "20px")};
  align-items: center;
  padding: ${({ $compact }) => ($compact ? "12px 0" : "16px 0")};
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};

  &:first-child {
    padding-top: 0;
  }

  @media (max-width: 767px) {
    grid-template-columns: ${({ $compact }) =>
      $compact ? "48px minmax(0, 1fr) auto" : "56px minmax(0, 1fr)"};
    gap: 12px;
    align-items: ${({ $compact }) => ($compact ? "center" : "start")};
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

export const ProductPrice = styled.div`
  justify-self: end;
  white-space: nowrap;

  @media (max-width: 767px) {
    grid-column: 2;
    justify-self: start;
  }
`;

export const ProductTotal = styled(Text)<{ $compact?: boolean }>`
  && {
    justify-self: end;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme, $compact }) =>
      $compact ? theme.fontSize.medium : theme.fontSize.large};
    font-weight: ${({ $compact }) => ($compact ? 400 : undefined)};
    white-space: nowrap;
  }

  @media (max-width: 767px) {
    ${({ $compact }) =>
      !$compact &&
      `
      grid-column: 2;
      justify-self: start;
    `}
  }
`;

export const Timeline = styled(AntdTimeline)`
  .ant-timeline-item {
    padding-bottom: 18px;
  }

  &&.ant-steps-dot .history-timeline-current-item .ant-steps-item-icon::after {
    width: 28px;
    height: 28px;
    border: 4px solid color-mix(in srgb, currentColor 35%, #fff);
    border-radius: 50%;
    box-sizing: border-box;
    background: transparent;
  }
`;
