import { Button } from "antd";
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

export const ParticipantPhoto = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-client-info-photo"),
)`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

export const ParticipantUsername = styled.div`
  margin-top: 8px;
  text-align: center;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: 13px;
  line-height: 1.4;
`;

export const LinkExistingClientButton = styled(Button)`
  margin-top: 12px;
  border-style: dashed !important;
`;

export const LinkExistingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
`;

export const LinkExistingClientState = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px 0;
`;

export const LinkExistingClientList = styled.div`
  max-height: 280px;
  overflow: auto;
`;

export const ProfileDrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
`;

export const ProfileName = styled.h3`
  margin: 0;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 600;
  text-align: center;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SectionLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const PhoneRow = styled.div`
  font-size: 15px;
  line-height: 1.4;
`;

export const SocialLinksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SocialLinkCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  padding: 8px 10px 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.functional.background.natural};
`;

export const SocialLinkMain = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

export const StatLabel = styled.div`
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const LastOrderCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.functional.border.selected};
  }
`;
