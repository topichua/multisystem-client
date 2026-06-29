import { Button, Card, Flex, Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() => dataQaAttrs("settings-mobile-hub"))`
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
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
    line-height: 1.25;
  }
`;

export const Sections = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Section = styled.section`
  min-width: 0;
`;

export const SectionTitle = styled(Typography.Text)`
  && {
    display: block;
    margin: 0 0 8px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: 0;
  }
`;

export const SectionCard = styled(Card)`
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

export const ItemButton = styled(Button)`
  && {
    width: 100%;
    height: auto;
    min-height: 68px;
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

export const ItemContent = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
  }
`;

export const IconTile = styled.span`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.colors.semantic.primary};
  background: ${({ theme }) => theme.colors.functional.background.active};
  box-shadow: inset 0 0 0 1px
    ${({ theme }) => theme.colors.functional.border.split};

  svg {
    width: 24px;
    height: 24px;
  }
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

export const ItemDescription = styled(Typography.Text)`
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

export const Caret = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.placeholder};
`;
