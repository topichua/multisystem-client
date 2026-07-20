import { Avatar, Typography } from "antd";
import styled from "styled-components";

const { Text } = Typography;

export const EditModalStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const EditSection = styled.section`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 14px;
`;

export const EditSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 767px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const EditLines = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
`;

export const EditLine = styled.div<{ $invalid?: boolean }>`
  display: grid;
  grid-template-columns:
    48px minmax(150px, 1fr) minmax(86px, 96px) minmax(104px, 116px)
    minmax(104px, 116px) minmax(96px, auto) 36px;
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 12px;
  border: 1px solid
    ${({ $invalid, theme }) =>
      $invalid
        ? theme.colors.functional.text.error
        : theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.functional.background.base};

  @media (max-width: 767px) {
    grid-template-columns: 48px minmax(0, 1fr) 36px;
    align-items: start;
  }
`;

export const EditLineImage = styled(Avatar)`
  && {
    border-radius: ${({ theme }) => theme.radius.medium};
    background: ${({ theme }) => theme.colors.functional.background.natural};
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-weight: 600;
  }
`;

export const EditLineInfo = styled.div`
  min-width: 0;
`;

export const EditLineName = styled(Text)`
  && {
    display: block;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 767px) {
      white-space: normal;
      overflow-wrap: anywhere;
    }
  }
`;

export const EditLineMeta = styled(Text)`
  && {
    display: block;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 767px) {
      white-space: normal;
      overflow-wrap: anywhere;
    }
  }
`;

export const EditLineControl = styled.label`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 767px) {
    grid-column: 2 / 4;
  }
`;

export const EditLineTotal = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  white-space: nowrap;

  @media (max-width: 767px) {
    grid-column: 2 / 4;
    align-items: flex-start;
  }
`;

export const EditDiscountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;
