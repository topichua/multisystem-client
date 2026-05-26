import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details"),
)`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
  min-width: 0;
  height: 100%;
`;

export const ThreadColumn = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-thread"),
)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
`;

export const MessagesScroll = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-messages"),
)`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
`;

export const MessagesInner = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-message-list"),
)`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  min-height: 100%;
`;

export const DaySeparator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0 4px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.functional.border.split};
  }

  span {
    flex-shrink: 0;
    max-width: 85%;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.25;
    text-align: center;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;
