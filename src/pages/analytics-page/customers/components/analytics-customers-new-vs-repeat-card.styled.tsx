import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Section = styled.section.attrs(() =>
  dataQaAttrs("layout-analytics-customers-sales-structure-section"),
)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const StackedBar = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  height: 34px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.functional.background.hover};
`;

export const BarSegment = styled.div<{
  $color: string;
  $width: number;
}>`
  width: ${({ $width }) => $width}%;
  min-width: ${({ $width }) => ($width > 0 ? "44px" : "0")};
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color};
`;

export const BarLabel = styled.span<{
  $tone: "light" | "dark";
  $hidden: boolean;
}>`
  display: ${({ $hidden }) => ($hidden ? "none" : "inline-flex")};
  align-items: center;
  justify-content: center;
  color: ${({ theme, $tone }) =>
    $tone === "light"
      ? theme.colors.functional.text.inverted
      : theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
`;

export const SegmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 12px;
`;

export const SegmentCard = styled.div`
  min-width: 0;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.functional.background.natural};
`;

export const SegmentTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin-bottom: 8px;
`;

export const LegendDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 3px;
  background: ${({ $color }) => $color};
`;

export const SegmentTitle = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
`;

export const ClientsLine = styled.div`
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RevenueLine = styled.div`
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PercentLine = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
