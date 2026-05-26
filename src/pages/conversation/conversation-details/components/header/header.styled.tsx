import styled from "styled-components";

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
`;
