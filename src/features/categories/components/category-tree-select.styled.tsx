import { Tree } from "antd";
import styled, { css } from "styled-components";

export const SelectRoot = styled.div`
  width: 100%;
`;

export const SelectControl = styled.div<{
  $disabled: boolean;
  $open: boolean;
  $status?: "error" | "warning";
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 35px;
  padding: 4px 10px 4px 12px;
  border: 1px solid
    ${({ $status, theme }) =>
      $status === "error"
        ? theme.colors.semantic.error
        : theme.colors.functional.border.outline};
  border-radius: 8px;
  background: ${({ $disabled, theme }) =>
    $disabled
      ? theme.colors.functional.background.disabled
      : theme.colors.functional.background.elevated};
  color: ${({ $disabled, theme }) =>
    $disabled
      ? theme.colors.functional.text.disabled
      : theme.colors.functional.text.primary};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  ${({ $open, $status, theme }) =>
    $open || $status === "error"
      ? css`
          border-color: ${
            $status === "error"
              ? theme.colors.semantic.error
              : theme.colors.functional.border.selected
          };
          box-shadow: 0 0 0 2px
            ${
              $status === "error"
                ? theme.colors.functional.background.error
                : theme.colors.functional.background.active
            };
        `
      : undefined}

  &:hover {
    border-color: ${({ $disabled, $status, theme }) =>
      $disabled
        ? theme.colors.functional.border.outline
        : $status === "error"
          ? theme.colors.semantic.error
          : theme.colors.functional.border.selected};
  }
`;

export const SelectedValue = styled.span<{ $placeholder: boolean }>`
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $placeholder, theme }) =>
    $placeholder
      ? theme.colors.functional.text.placeholder
      : theme.colors.functional.text.primary};
`;

export const ControlIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const DropdownPanel = styled.div<{ $width?: number }>`
  width: ${({ $width }) => ($width ? `${$width}px` : "320px")};
  max-width: calc(100vw - 32px);
  padding: 8px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  box-shadow: ${({ theme }) => theme.shadow.large};
`;

export const DropdownSearch = styled.div`
  padding-bottom: 6px;
`;

export const NoCategoryOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 4px 8px;
  border: 0;
  border-radius: 6px;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.functional.background.active : "transparent"};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }
`;

export const TreeShell = styled.div`
  max-height: 280px;
  overflow: auto;
  padding-top: 4px;
`;

export const CategoryTree = styled(Tree)`
  background: transparent;

  .ant-tree-treenode {
    width: 100%;
    padding: 1px 0;
  }

  .ant-tree-node-content-wrapper {
    flex: 1;
    min-width: 0;
    border-radius: 6px;
  }
`;

export const CategoryTitle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const CategoryIcon = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const CategoryName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EmptyState = styled.div`
  padding: 16px 8px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  text-align: center;
`;
