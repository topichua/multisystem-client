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
