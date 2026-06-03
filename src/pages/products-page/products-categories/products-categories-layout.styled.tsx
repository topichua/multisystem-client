import styled from "styled-components";

export const CategoryNavItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.functional.background.primary : "transparent"};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  cursor: pointer;
  text-align: left;
  margin-bottom: 4px;

  &:hover {
    background: ${({ $active, theme }) =>
      $active
        ? theme.colors.functional.background.primary
        : theme.colors.functional.background.hover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }

  .ant-typography {
    color: ${({ theme }) => theme.colors.functional.text.primary};
  }

  .ant-typography-secondary {
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  svg {
    color: ${({ $active, theme }) =>
      $active
        ? theme.colors.semantic.primary
        : theme.colors.functional.text.subdued};
  }
`;

export const CategoryNavIcon = styled.div<{ $active: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: ${({ $active, theme }) =>
    $active
      ? theme.colors.semantic.primary
      : theme.colors.functional.text.subdued};
  background: ${({ $active, theme }) =>
    $active
      ? theme.colors.functional.background.active
      : theme.colors.functional.background.natural};
`;
