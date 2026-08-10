import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const NavList = styled.nav.attrs(() =>
  dataQaAttrs("layout-analytics-primary-nav"),
)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
`;

export const NavItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 10px 12px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.functional.background.active : "transparent"};
  color: ${({ theme, $active }) =>
    $active
      ? theme.colors.semantic.primary
      : theme.colors.functional.text.primary};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  line-height: 1.25;
  cursor: pointer;
  text-align: left;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${({ theme, $active }) =>
        $active
          ? theme.colors.functional.background.active
          : theme.colors.functional.background.hover};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: -2px;
  }
`;

export const NavItemLabel = styled.span`
  min-width: 0;
  flex: 1 1 auto;
`;
