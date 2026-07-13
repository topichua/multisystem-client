import { Typography } from "antd";
import styled, { css } from "styled-components";

import type { InventoryHistoryBadgeTone } from "./products-inventory-history.utils";

export const DateCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const DateText = styled(Typography.Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: 14px;
    line-height: 1.3;
  }
`;

export const DetailsCell = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ItemTitle = styled(Typography.Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
  }
`;

const badgeToneStyles: Record<InventoryHistoryBadgeTone, ReturnType<typeof css>> =
  {
    success: css`
      color: ${({ theme }) => theme.colors.functional.text.success};
      background: ${({ theme }) => theme.colors.functional.background.success};
    `,
    error: css`
      color: ${({ theme }) => theme.colors.functional.text.error};
      background: ${({ theme }) => theme.colors.functional.background.error};
    `,
    neutral: css`
      color: ${({ theme }) => theme.colors.functional.text.subdued};
      background: ${({ theme }) => theme.colors.functional.background.elevated};
    `,
  };

export const TypeBadge = styled.span<{
  $tone: InventoryHistoryBadgeTone;
  $compact?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ $compact }) => ($compact ? "24px" : "28px")};
  padding: ${({ $compact }) => ($compact ? "2px 10px" : "2px 12px")};
  border-radius: 999px;
  font-size: ${({ $compact }) => ($compact ? "12px" : "13px")};
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;

  ${({ $tone }) => badgeToneStyles[$tone]}
`;

export const ChangeText = styled(Typography.Text)<{ $positive: boolean }>`
  && {
    font-size: 15px;
    font-weight: 700;
    color: ${({ $positive, theme }) =>
      $positive
        ? theme.colors.functional.text.success
        : theme.colors.functional.text.error};
  }
`;
