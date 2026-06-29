import { Button, Card, Flex, Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("orders-mobile-list-page"),
)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const Header = styled.header`
  box-sizing: border-box;
  flex: 0 0 auto;
  min-width: 0;
  padding: 16px 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ScrollRegion = styled.div`
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 0 16px calc(32px + env(safe-area-inset-bottom, 0px));
`;

export const TitleCluster = styled.div`
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  gap: 4px;
`;

export const BackButton = styled(Button)`
  && {
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    padding: 0;
    margin-inline-start: -8px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const PageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    flex: 1 1 auto;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  margin-top: 4px;
`;

export const OrderCard = styled(Card)`
  && {
    overflow: hidden;
    border-color: ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    box-shadow: ${({ theme }) => theme.shadow.cardShadow};
    cursor: pointer;
  }

  && .ant-card-body {
    padding: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    &&:hover {
      border-color: ${({ theme }) => theme.colors.functional.border.selected};
    }
  }

  &&:active {
    background: ${({ theme }) => theme.colors.functional.background.active};
  }
`;

export const CardBody = styled.div`
  padding: 12px;
`;

export const TopRow = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
    margin-bottom: 4px;
  }
`;

export const OrderNumber = styled(Typography.Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.25;
  }
`;

export const CreatedDate = styled(Typography.Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.25;
    white-space: nowrap;
  }
`;

export const CustomerName = styled(Typography.Text)`
  && {
    display: block;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const MetaRow = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
  }
`;

export const TotalAmount = styled(Typography.Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: 600;
    line-height: 1.25;
    white-space: nowrap;
  }
`;

export const StatusSection = styled.div`
  min-width: 0;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const FieldLabel = styled(Typography.Text)`
  && {
    display: block;
    margin-bottom: 6px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.25;
  }
`;

export const StatusControl = styled.div`
  min-width: 0;
  cursor: default;

  .ant-select {
    width: 100%;
  }
`;

export const NoteSection = styled.div`
  min-width: 0;
  margin-top: 12px;
`;

export const InternalNote = styled(Typography.Text)`
  && {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.35;
  }
`;

export const StateContainer = styled.div`
  min-width: 0;
  margin-top: 16px;
  padding: 24px 0;
`;

export const PaginationWrap = styled.div`
  display: flex;
  justify-content: center;
  min-width: 0;
  margin-top: 16px;
  padding-top: 8px;
`;

export const ErrorText = styled(Typography.Text)`
  && {
    display: block;
    margin-bottom: 8px;
  }
`;
