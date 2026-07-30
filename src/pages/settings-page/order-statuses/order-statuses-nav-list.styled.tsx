import styled from "styled-components";

export const NavRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: 4px 8px 12px;
`;

export const CategorySection = styled.section`
  min-width: 0;
`;

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 0 2px;
`;

export const CategoryDot = styled.span<{ $color: string }>`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

export const CategoryTitle = styled.span<{ $color: string }>`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $color }) => $color};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const CategoryAddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.functional.background.hover};
    color: ${({ theme }) => theme.colors.functional.text.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const StatusCard = styled.ul`
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;

export const StatusItem = styled.li<{ $selected: boolean; $accent: string }>`
  display: flex;
  align-items: stretch;
  min-width: 0;
  background: ${({ $selected, $accent }) =>
    $selected
      ? `color-mix(in srgb, ${$accent} 14%, transparent)`
      : "transparent"};

  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }

  &:hover {
    background: ${({ $selected, $accent, theme }) =>
      $selected
        ? `color-mix(in srgb, ${$accent} 18%, transparent)`
        : theme.colors.functional.background.hover};
  }
`;

export const StatusButton = styled.button<{
  $selected: boolean;
  $accent: string;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  margin: 0;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: ${({ $selected, $accent, theme }) =>
    $selected ? $accent : theme.colors.functional.text.primary};
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: -2px;
  }
`;

export const StatusName = styled.span<{ $selected?: boolean }>`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ $selected }) => ($selected ? 600 : 500)};
  line-height: 1.25;
`;

export const Caret = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.functional.text.placeholder};
`;
