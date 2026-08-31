import styled, { css } from "styled-components";
import { Button } from "antd";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Header = styled.header.attrs(() =>
  dataQaAttrs("layout-conversation-details-header"),
)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};

  @media (max-width: 767px) {
    gap: 8px;
    padding: 4px 8px;
    background: ${({ theme }) => theme.colors.functional.background.base};
  }
`;

export const BackButton = styled(Button)`
  && {
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    margin: 0 0 0 -8px;
    padding: 0;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const HeaderText = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-header-title"),
)`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0;
  min-width: 0;
`;

export const HeaderAside = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-header-actions"),
)`
  flex-shrink: 0;
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 767px) {
    margin-left: auto;
  }
`;

export const HeaderMoreButton = styled(Button)`
  && {
    width: 44px;
    height: 44px;
    padding: 0;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const HeaderActionsMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(280px, calc(100vw - 48px));
  overflow: visible;

  .ant-select {
    min-width: 0 !important;
    width: 100%;
  }

  .ant-btn {
    width: 100%;
    justify-content: flex-start;
  }
`;

export const FollowUpButton = styled(Button)<{
  $scheduled: boolean;
}>`
  && {
    height: 35px;

    ${({ $scheduled, theme }) =>
      $scheduled &&
      css`
        color: ${theme.colors.functional.text.warning};
        background: ${theme.colors.base.yellow[1]};
        border-color: ${theme.colors.base.yellow[4]};

        &:hover,
        &:focus-visible {
          color: ${theme.colors.functional.text.warning} !important;
          background: ${theme.colors.base.yellow[2]} !important;
          border-color: ${theme.colors.base.yellow[6]} !important;
        }
      `}
  }
`;
