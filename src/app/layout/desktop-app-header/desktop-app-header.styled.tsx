import { Button, Input } from "antd";
import styled from "styled-components";

import {
  DESKTOP_HEADER_HEIGHT,
  SIDER_WIDTH,
} from "@/app/layout/layout-constants";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Header = styled.header.attrs(() =>
  dataQaAttrs("layout-desktop-app-header"),
)`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: ${DESKTOP_HEADER_HEIGHT};
  grid-column: 1 / -1;
  grid-row: 1;
  display: grid;
  grid-template-columns:
    ${SIDER_WIDTH} auto minmax(180px, 440px) minmax(0, 1fr)
    auto;
  align-items: center;
  padding: 0 16px 0 0;
  z-index: 20;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const BrandButton = styled(Button)`
  && {
    width: 40px;
    min-width: 40px;
    height: 40px;
    padding: 0;
    justify-self: center;
    color: ${({ theme }) => theme.colors.functional.text.heading};
  }
`;

export const BrandLogo = styled.img`
  width: 28px;
  height: 28px;
  display: block;
  flex: 0 0 auto;
`;

export const SearchField = styled.div`
  grid-column: 3 / 5;
  justify-self: center;
  width: 100%;
  max-width: 440px;
  min-width: 0;
`;

export const SearchInput = styled(Input)`
  && {
    height: 30px;
  }
`;

export const Actions = styled.div`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

export const ProfileButton = styled(Button)`
  && {
    min-width: 0;
    max-width: 220px;
    height: 36px;
    padding: 0 8px;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
  }
`;

export const ProfileAvatarSlot = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const ProfileName = styled.span`
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const IconButton = styled(Button)`
  && {
    width: 32px;
    min-width: 32px;
    height: 32px;
    padding: 0;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const StyledStatusButton = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  height: 32px;
  padding: 0 10px 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.extraLarge};
  color: ${({ theme }) => theme.colors.functional.text.heading};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  /* justify-content: space-between; */
  gap: 8px;
  /* width: 150px; */

  &:hover {
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  & > svg {
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }
`;

export const StatusDot = styled.span<{ $color: string }>`
  display: block;
  width: 8px;
  height: 8px;
  min-width: 8px;
  max-width: 8px;
  min-height: 8px;
  max-height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

export const StatusMenuItem = styled.span`
  min-width: 220px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

export const StatusMenuItemContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const StatusButtonWrapper = styled.div`
  width: 150px;
`;

export const StatusMenuItemLabel = styled.span<{ $selected?: boolean }>`
  color: ${({ theme, $selected }) =>
    $selected
      ? theme.colors.functional.text.primary
      : theme.colors.functional.text.subdued};
  font-weight: ${({ $selected }) => ($selected ? 700 : 400)};
  line-height: 1.2;
`;

export const StatusMenuCheck = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.semantic.primary};
`;

export const CustomDivider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.functional.border.cardBase};
`;
