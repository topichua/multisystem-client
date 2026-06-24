import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-client-info"),
)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

export const PanelScroll = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-client-info-scroll"),
)`
  flex: 1;
  min-height: 0;
  overflow: auto;
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
