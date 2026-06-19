import styled from "styled-components";

import { RoleDot } from "@/shared/components/role-dot/role-dot";

const MODAL_SCROLLABLE_LIST_MAX_HEIGHT = 'clamp(220px, 34dvh, 360px)';

export const RoleOptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  max-height: ${MODAL_SCROLLABLE_LIST_MAX_HEIGHT};
  overflow-y: auto;
  padding-right: 4px;
  overscroll-behavior: contain;
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

export const RoleOptionDot = styled(RoleDot)`
  margin-top: 6px;
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
