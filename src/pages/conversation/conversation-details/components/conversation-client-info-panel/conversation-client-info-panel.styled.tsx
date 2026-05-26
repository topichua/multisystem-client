import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.aside.attrs(() =>
  dataQaAttrs("layout-conversation-details-client-info"),
)`
  box-sizing: border-box;
  flex-shrink: 0;
  width: min(360px, 40vw);
  min-width: 260px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;

export const PanelHeader = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-client-info-header"),
)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.split};
`;

export const PanelScroll = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-client-info-scroll"),
)`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

export const EmptyCenter = styled.div`
  flex: 1;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ParticipantPhoto = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-client-info-photo"),
)<{ $flush?: boolean }>`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ $flush }) => ($flush ? 0 : "16px")};
`;
