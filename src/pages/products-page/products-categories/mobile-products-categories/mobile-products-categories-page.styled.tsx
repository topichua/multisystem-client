import { Button, Card, Input, Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("products-mobile-categories"),
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
  flex-direction: column;
  gap: 12px;
`;

export const HeaderTopRow = styled.div`
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
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const TitleCopy = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`;

export const PageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const PageSubtitle = styled(Typography.Text)`
  && {
    display: block;
    min-width: 0;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.35;
  }
`;

export const CreateButton = styled(Button)`
  && {
    flex: 0 0 auto;
  }
`;

export const CreateButtonLabel = styled.span`
  @media (max-width: 420px) {
    display: none;
  }
`;

export const SearchInput = styled(Input.Search)`
  && {
    width: 100%;
  }
`;

export const TreeCard = styled(Card)`
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

export const StateContainer = styled.div`
  min-width: 0;
  padding: 24px 0;
`;
