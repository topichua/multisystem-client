import styled from "styled-components";

import { UserAvatar } from "@/components/user-avatar";

const collapsedSiderWidth = "72px";
const panelPadding = "8px";
const profileAvatarSlotWidth = `calc(${collapsedSiderWidth} - (${panelPadding} * 2))`;
const profileItemHeight = "40px";
const profileTransition = "0.22s ease";
const profileTextMaxWidth = "160px";

export const Avatar = styled(UserAvatar)`
  && {
    font-size: 12px;
  }

  &:hover {
    cursor: pointer;
  }
`;

export const ProfileTrigger = styled.div`
  align-self: stretch;
  min-width: 0;
  max-width: 100%;
  height: ${profileItemHeight};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0;
  border-radius: ${(props) => props.theme.radius.medium};
  box-sizing: border-box;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    background: ${(props) => props.theme.colors.functional.background.hover};
  }
`;

export const ProfileAvatarSlot = styled.div`
  width: ${profileAvatarSlotWidth};
  min-width: ${profileAvatarSlotWidth};
  height: ${profileItemHeight};
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
`;

export const ProfileText = styled.div<{ $collapsed: boolean }>`
  flex: ${(props) => (props.$collapsed ? "0 0 auto" : "1 1 auto")};
  min-width: 0;
  max-width: ${(props) => (props.$collapsed ? "0" : profileTextMaxWidth)};
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-inline-end: ${(props) => (props.$collapsed ? "0" : "6px")};
  box-sizing: border-box;
  white-space: nowrap;
  transition:
    opacity ${profileTransition},
    max-width ${profileTransition},
    padding-inline-end ${profileTransition};
`;

export const ProfileName = styled.span`
  min-width: 0;
  overflow: hidden;
  color: ${(props) => props.theme.colors.functional.text.heading};
  font-size: ${(props) => props.theme.fontSize.medium};
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProfileSubtitle = styled.span`
  min-width: 0;
  overflow: hidden;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  font-size: ${(props) => props.theme.fontSize.small};
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
