import { Link } from "react-router";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Section = styled.section.attrs(() =>
  dataQaAttrs("layout-analytics-customers-returning-section"),
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

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const FunnelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 2px;
`;

export const FunnelRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const FunnelMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`;

export const FunnelLabel = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FunnelValues = styled.div`
  display: inline-flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 10px;
  flex: 0 0 auto;
  white-space: nowrap;
`;

export const FunnelClients = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 700;
  line-height: 1.3;
`;

export const FunnelPercent = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
`;

export const ProgressWrap = styled.div`
  width: 100%;
  min-width: 0;
  line-height: 1;

  .ant-progress {
    display: block;
    line-height: 1;
  }
`;

export const TimingChart = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: end;
  gap: 18px;
  min-height: 190px;
  padding-top: 8px;

  @media (max-width: 700px) {
    gap: 12px;
  }
`;

export const TimingColumn = styled.div`
  display: grid;
  grid-template-rows: 24px 120px auto;
  align-items: end;
  justify-items: center;
  gap: 8px;
  min-width: 0;
`;

export const TimingValue = styled.div`
  align-self: start;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
`;

export const TimingBarSlot = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

export const TimingBar = styled.div<{
  $height: number;
  $isEmpty: boolean;
}>`
  width: 44px;
  height: ${({ $height }) => $height}%;
  min-height: ${({ $isEmpty }) => ($isEmpty ? "0" : "8px")};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.semantic.primary};

  @media (max-width: 700px) {
    width: 34px;
  }
`;

export const TimingLabel = styled.div`
  width: 100%;
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const WinBackBucketsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const WinBackBucketCard = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.functional.background.natural};
`;

export const WinBackBucketLabelRow = styled.div`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export const WinBackDot = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;

export const WinBackBucketLabel = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const WinBackBucketValue = styled.div`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.extraLarge};
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
`;

export const WinBackFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  padding-top: 18px;
  border-top: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};

  @media (max-width: 600px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const WinBackSummary = styled.div`
  min-width: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
`;

export const WinBackSummaryValue = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.extraLarge};
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
`;

export const WinBackSummaryText = styled.span`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
`;

export const WinBackLink = styled(Link)`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.semantic.primary};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 600;
  line-height: 1.3;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.functional.link.hover};
  }
`;
