import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("instagram-mobile-account-switcher"),
)`
  min-width: 0;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 0 4px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const AccountChip = styled.button<{ $active?: boolean }>`
  min-width: 0;
  min-height: 42px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(72vw, 280px);
  padding: 6px 10px 6px 6px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active
        ? theme.colors.functional.border.selected
        : theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ $active, theme }) =>
    $active
      ? theme.colors.functional.background.primary
      : theme.colors.functional.background.elevated};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const AccountCopy = styled.span`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
`;

export const AccountName = styled.span`
  max-width: 190px;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AccountMeta = styled.span`
  max-width: 190px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.extraSmall};
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LoadingSlot = styled.div`
  min-height: 42px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;
