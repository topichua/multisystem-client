import { Button, Typography } from "antd";
import styled from "styled-components";

export const VariantTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
`;

export const VariantTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1 1 auto;
`;

export const VariantTitle = styled(Typography.Text)<{ $clickable?: boolean }>`
  && {
    min-width: 0;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
    ${({ $clickable, theme }) =>
      $clickable
        ? `
      display: inline-block;
      max-width: 100%;
      width: fit-content;
      cursor: pointer;
      transition: color 0.15s ease, box-shadow 0.15s ease;
      padding-bottom: 1px;
      box-shadow: inset 0 -1px 0 0 transparent;

      &:hover {
        color: ${theme.colors.functional.link.hover};
        box-shadow: inset 0 -1px 0 0 ${theme.colors.functional.link.hover};
      }
    `
        : ""}
  }
`;

export const VariantActions = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const ActionButton = styled(Button)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const VariantBottomRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
`;

export const VariantSku = styled(Typography.Text)`
  && {
    min-width: 0;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: 13px;
    line-height: 1.3;
  }
`;

export const StockMetrics = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-shrink: 0;
`;

export const StockMetric = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 52px;
`;

export const StockMetricValue = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
`;

export const StockMetricLabel = styled(Typography.Text)`
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const VariantCard = styled.div<{ $archived?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  opacity: ${({ $archived }) => ($archived ? 0.5 : 1)};

  ${({ $archived, theme }) =>
    $archived
      ? `
    ${VariantTitle},
    ${VariantSku},
    ${StockMetricValue},
    ${StockMetricLabel} {
      color: ${theme.colors.functional.text.subdued} !important;
    }
  `
      : ""}
`;
