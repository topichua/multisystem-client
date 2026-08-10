import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Grid = styled.div.attrs(() =>
  dataQaAttrs("layout-analytics-customers-kpi-grid"),
)`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Card = styled.article.attrs(() =>
  dataQaAttrs("layout-analytics-customers-kpi-card"),
)`
  box-sizing: border-box;
  min-width: 0;
  min-height: 146px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;

export const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

export const IconTile = styled.span`
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.colors.semantic.primary};
  background: ${({ theme }) => theme.colors.functional.background.active};

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ChangeBadge = styled.span<{
  $tone: "positive" | "negative" | "neutral";
}>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  line-height: 1.2;
  color: ${({ theme, $tone }) => {
    if ($tone === "positive") {
      return theme.colors.functional.text.success;
    }
    if ($tone === "negative") {
      return theme.colors.functional.text.error;
    }

    return theme.colors.functional.text.disabled;
  }};
  background: ${({ theme, $tone }) => {
    if ($tone === "positive") {
      return theme.colors.functional.background.success;
    }
    if ($tone === "negative") {
      return theme.colors.functional.background.error;
    }

    return theme.colors.functional.background.natural;
  }};

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

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const Label = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
`;

export const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.disabled};
  font-size: 12px;
`;

export const ScopeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 8px;
  padding: 3px 8px;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.functional.text.disabled};
  background: ${({ theme }) => theme.colors.functional.background.natural};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.2;
`;

export const SkeletonCard = styled(Card)`
  min-height: 146px;
`;
