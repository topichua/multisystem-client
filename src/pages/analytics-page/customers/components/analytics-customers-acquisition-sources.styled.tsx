import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Section = styled.section.attrs(() =>
  dataQaAttrs("layout-analytics-customers-acquisition-section"),
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

export const SourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
`;

export const SourceRow = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 140px) minmax(0, 1fr) 54px 54px;
  align-items: center;
  gap: 14px;
  min-width: 0;

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr) 54px 54px;
  }
`;

export const SourceNameCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  @media (max-width: 700px) {
    grid-column: 1 / -1;
  }
`;

export const SourceDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 3px;
  background: ${({ $color }) => $color};
`;

export const SourceName = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SourceBarTrack = styled.div`
  width: 100%;
  min-width: 0;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.functional.background.natural};
`;

export const SourceBarFill = styled.div<{
  $color: string;
  $width: number;
}>`
  width: ${({ $width }) => $width}%;
  height: 100%;
  border-radius: inherit;
  background: ${({ $color }) => $color};
`;

export const SourceClients = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 700;
  line-height: 1.3;
  text-align: right;
  white-space: nowrap;
`;

export const SourcePercent = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.3;
  text-align: right;
  white-space: nowrap;
`;
