import styled from "styled-components";
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
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px 10px;
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
  gap: 2px;
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
    width: 100%;
    min-width: 0;
    margin-left: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 44px;
    gap: 8px;

    .ant-select {
      min-width: 0 !important;
      width: 100%;
    }

    .ant-btn {
      width: 44px;
      min-width: 44px;
      height: 35px;
      padding: 0;
    }
  }
`;
