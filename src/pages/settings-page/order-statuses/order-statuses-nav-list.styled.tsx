import styled from "styled-components";

export const NavRoot = styled.div`
  padding: 0 8px 12px;
`;

export const CategorySection = styled.section`
  &:not(:first-child) {
    margin-top: 12px;
  }
`;

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 4px;
`;

export const CategoryDot = styled.span<{ $color: string }>`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 1px solid rgba(0, 0, 0, 0.12);
`;

export const CategoryTitleCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
`;

export const CategoryTitle = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const CategoryCount = styled.span`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.functional.text.placeholder};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 500;
  line-height: 1.25;
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

export const StatusTree = styled.ul`
  list-style: none;
  /* margin: 4px 0 0; */
  margin-left: 8px;
  padding: 0 0 0 11px;
  border-left: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const StatusItem = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: stretch;
  border-radius: 8px;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.functional.background.primary : "transparent"};
  box-shadow: ${({ $selected, theme }) =>
    $selected
      ? `inset 0 0 0 1px ${theme.colors.functional.border.selected}`
      : "none"};

  &:hover {
    background: ${({ $selected, theme }) =>
      $selected
        ? theme.colors.functional.background.primary
        : theme.colors.functional.background.hover};
  }
`;

export const StatusButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 36px;
  margin: 0;
  padding: 6px 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font: inherit;
  text-align: start;
  cursor: pointer;
`;

export const StatusDot = styled.span<{ $color: string }>`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

export const StatusName = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.25;
`;
