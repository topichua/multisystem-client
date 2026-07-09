import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Grid = styled.div.attrs(() =>
  dataQaAttrs("layout-analytics-overview-kpi-grid"),
)`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Card = styled.article.attrs(() =>
  dataQaAttrs("layout-analytics-overview-kpi-card"),
)`
  box-sizing: border-box;
  min-width: 0;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;

export const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

export const IconTile = styled.span`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.colors.semantic.primary};
  background: ${({ theme }) => theme.colors.functional.background.active};

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ChangeBadge = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  line-height: 1.2;
  color: ${({ theme, $positive }) =>
    $positive
      ? theme.colors.functional.text.success
      : theme.colors.functional.text.error};
  background: ${({ theme, $positive }) =>
    $positive
      ? theme.colors.functional.background.success
      : theme.colors.functional.background.error};

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const Value = styled.div`
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.ultraLarge};
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Label = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
`;

export const SkeletonCard = styled(Card)`
  min-height: 132px;
`;
