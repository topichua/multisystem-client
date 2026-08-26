import { Button, Card, Flex, Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("settings-mobile-groups-list"),
)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 16px 16px calc(32px + env(safe-area-inset-bottom, 0px));
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const Header = styled.header`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const TitleRow = styled.div`
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

export const CreateButton = styled(Button)`
  && {
    flex: 0 0 auto;
  }
`;

export const CreateButtonLabel = styled.span`
  @media (max-width: 359px) {
    display: none;
  }
`;

export const ListCard = styled(Card)`
  && {
    overflow: hidden;
    border-color: ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    box-shadow: ${({ theme }) => theme.shadow.cardShadow};
  }

  && .ant-card-body {
    padding: 0;
  }
`;

export const GroupItemButton = styled(Button)`
  && {
    width: 100%;
    height: auto;
    min-height: 48px;
    padding: 12px;
    border: 0;
    border-radius: 0;
    color: ${({ theme }) => theme.colors.functional.text.primary};
    text-align: left;
    white-space: normal;
  }

  &&:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }

  &&:hover {
    background: transparent;
    color: ${({ theme }) => theme.colors.functional.text.primary};
  }

  @media (hover: hover) and (pointer: fine) {
    &&:hover {
      background: ${({ theme }) => theme.colors.functional.background.hover};
    }
  }

  &&:active {
    background: ${({ theme }) => theme.colors.functional.background.active};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: -2px;
  }
`;

export const GroupItemStatic = styled.div`
  width: 100%;
  min-height: 48px;
  padding: 12px;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.functional.text.primary};

  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }
`;

export const ListDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.functional.border.split};
`;

export const ItemContent = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
  }
`;

export const ColorIconSlot = styled.span`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
`;

export const ColorDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex: 0 0 auto;
`;

export const ItemCopy = styled(Flex)`
  && {
    min-width: 0;
    flex: 1 1 auto;
  }
`;

export const ItemTitle = styled(Typography.Text)`
  && {
    display: block;
    min-width: 0;
    flex: 1 1 auto;
    max-width: 100%;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: 600;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const ItemPreview = styled(Typography.Text)`
  && {
    display: block;
    max-width: 100%;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const ItemCount = styled(Typography.Text)`
  && {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
`;

export const Caret = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.placeholder};
`;

export const StateContainer = styled.div`
  min-width: 0;
  padding: 24px 0;
`;
