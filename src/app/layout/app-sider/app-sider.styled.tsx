import styled from "styled-components";

import { SIDER_WIDTH } from "@/app/layout/layout-constants";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Wrapper = styled.aside.attrs(() =>
  dataQaAttrs("layout-app-sider"),
)`
  width: ${SIDER_WIDTH};
  min-width: ${SIDER_WIDTH};
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  box-sizing: border-box;
  padding: 8px;
  overflow-x: hidden;
  overflow-y: auto;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const Nav = styled.nav.attrs(() =>
  dataQaAttrs("layout-app-sider-nav"),
)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  box-sizing: border-box;
`;

export const NavItem = styled.button`
  appearance: none;
  width: 100%;
  min-width: 0;
  height: 44px;
  margin: 0;
  padding: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.functional.text.navItem};
  cursor: pointer;
  overflow: visible;
  transition: color 0.16s ease;
  box-sizing: border-box;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.semantic.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }

  &[aria-current='page'] {
    color: ${({ theme }) => theme.colors.semantic.primary};
  }
`;

export const NavItemIcon = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: currentColor;
  line-height: 1;
`;

export const NavItemLabel = styled.span`
  width: 100%;
  min-width: 0;
  overflow: hidden;
  color: currentColor;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${NavItem}[aria-current="page"] & {
    font-weight: 700;
  }
`;
