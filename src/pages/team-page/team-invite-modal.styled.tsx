import styled from "styled-components";

import { base } from "@/styled/definitions/colors";

export const RoleOptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const RoleOptionCard = styled.button<{ $selected: boolean }>`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid
    ${({ $selected, theme }) =>
      $selected
        ? theme.colors.semantic.primary
        : theme.colors.functional.border.cardBase};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: ${({ $selected, theme }) =>
      $selected
        ? theme.colors.semantic.primary
        : theme.colors.functional.border.primary};
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const RoleDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: 0 0 auto;
  margin-top: 6px;
  background: ${({ $color }) => $color};
`;

export const RoleOptionContent = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

export const RoleCheck = styled.span<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  margin-top: 2px;
  border: 2px solid
    ${({ $selected, theme }) =>
      $selected
        ? theme.colors.semantic.primary
        : theme.colors.functional.border.cardBase};
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.semantic.primary : "transparent"};
  color: ${({ theme }) => theme.colors.functional.text.inverted};
`;

export const ModalDescription = styled.p`
  margin: 0 0 20px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: 14px;
  line-height: 1.5;
`;

export const ModalFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

export const ROLE_DOT_COLORS = {
  manager: base.blue[6],
  operator: base.cyan[6],
} as const;
