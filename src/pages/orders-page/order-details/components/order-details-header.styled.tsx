import { Button, Typography } from "antd";
import styled from "styled-components";

const { Text, Title: AntTitle } = Typography;

export const HeaderRoot = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 980px) {
    flex-direction: column;
  }
`;

export const LeftCluster = styled.div`
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 16px;
`;

export const BackButton = styled(Button)`
  && {
    flex: 0 0 auto;
    padding: 0;
    border-radius: ${({ theme }) => theme.radius.large};
  }
`;

export const TitleBlock = styled.div`
  min-width: 0;
`;

export const TitleRow = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const Title = styled(AntTitle)`
  && {
    margin: 0;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-weight: 700;
    line-height: 1.2;
  }
`;

export const StatusBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, ${({ $color }) => $color} 14%, transparent);
  color: ${({ $color }) => $color};
  line-height: 1;
`;

export const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
`;

export const MetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

export const MetaItem = styled(Text)`
  && {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const MetaSeparator = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.disabled};
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-left: auto;
  flex-wrap: wrap;

  @media (max-width: 980px) {
    width: 100%;
    justify-content: flex-start;
    margin-left: 64px;
  }

  @media (max-width: 560px) {
    margin-left: 0;
  }
`;

export const PrintButton = styled(Button)`
  && {
    border-radius: ${({ theme }) => theme.radius.large};
    font-weight: 600;
  }
`;

export const StatusSelectSlot = styled.div`
  min-width: 176px;
`;
