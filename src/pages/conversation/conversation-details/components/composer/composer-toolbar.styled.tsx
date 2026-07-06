import styled, { css } from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Toolbar = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-composer-toolbar"),
)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  min-width: 0;
`;

export const Tabs = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
`;

const tabBase = css`
  position: relative;
  padding: 0 0 8px;
  border: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
`;

export const Tab = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  ${tabBase}
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  color: ${({ $active, $disabled, theme }) => {
    if ($disabled) {
      return theme.colors.functional.text.subdued;
    }

    if ($active) {
      return theme.colors.semantic.primary;
    }

    return theme.colors.functional.text.primary;
  }};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};

  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    border-radius: 2px;
    background: ${({ $active, theme }) =>
      $active ? theme.colors.semantic.primary : "transparent"};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;
