import { Card } from "antd";
import styled, { css } from "styled-components";

type SpanProps = { $span?: "default" | "full" };

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SummaryCard = styled.div`
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  box-shadow: ${({ theme }) => theme.shadow.cardShadow};
`;

export const SummaryLabel = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.35;
  margin-bottom: 6px;
`;

export const SummaryValue = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

export const ChartCard = styled(Card)<SpanProps>`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  box-shadow: ${({ theme }) => theme.shadow.cardShadow};
  overflow: hidden;

  ${({ $span }) =>
    $span === "full" &&
    css`
      grid-column: 1 / -1;
    `}

  .ant-card-body {
    padding: 20px 20px 12px;
  }
`;

export const ChartCardHeader = styled.div`
  margin-bottom: 4px;
`;

export const ChartCardTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 600;
  line-height: 1.35;
`;

export const ChartCardSubtitle = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.4;
`;

export const ChartContainer = styled.div`
  width: 100%;
  min-height: 280px;
`;
