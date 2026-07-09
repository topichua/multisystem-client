import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Legend = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.3;
  white-space: nowrap;
`;

export const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.semantic.primary};
`;

export const RevenueChartCard = styled.article.attrs(() =>
  dataQaAttrs("layout-analytics-overview-revenue-chart"),
)`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;
