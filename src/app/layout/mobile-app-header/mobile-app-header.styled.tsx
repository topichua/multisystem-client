import { Button } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Header = styled.header.attrs(() =>
  dataQaAttrs("layout-mobile-app-header"),
)`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: calc(56px + env(safe-area-inset-top, 0px));
  padding: env(safe-area-inset-top, 0px) 12px 0;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 56px;
  align-items: center;
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
  z-index: 20;
`;

export const ControlSlot = styled.div<{ $align: "left" | "right" }>`
  width: 56px;
  min-width: 0;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: ${({ $align }) =>
    $align === "left" ? "flex-start" : "flex-end"};
`;

export const IconButton = styled(Button)`
  && {
    width: 44px;
    min-width: 44px;
    height: 44px;
    padding: 0;
    color: ${({ theme }) => theme.colors.functional.text.primary};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const BrandButton = styled.button`
  appearance: none;
  min-width: 0;
  max-width: 100%;
  height: 44px;
  margin: 0;
  padding: 0 8px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: transparent;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  justify-self: center;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const BrandLogo = styled.img`
  width: 28px;
  height: 28px;
  display: block;
  flex: 0 0 auto;
`;

export const BrandText = styled.span`
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DrawerTitle = styled.span`
  min-width: 0;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DrawerContent = styled.div.attrs(() =>
  dataQaAttrs("layout-mobile-navigation-drawer"),
)`
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const DrawerNavScroll = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px 0 0;

  .ant-menu {
    border-inline-end: 0;
    background: transparent;
  }

  .ant-menu-item {
    width: 100%;
    margin-inline: 0;
  }

  .ant-menu-item-group-title {
    padding-inline: 12px;
  }
`;

export const DrawerFooter = styled.div`
  flex: 0 0 auto;
  min-width: 0;
  padding: 0 0 calc(12px + env(safe-area-inset-bottom, 0px));
`;

export const DrawerThemeDivider = styled.hr`
  margin: 12px 12px;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const DrawerSectionLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.25;
`;

export const DrawerMenuLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ConversationDrawerContent = styled.div.attrs(() =>
  dataQaAttrs("layout-mobile-conversations-drawer"),
)`
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;
