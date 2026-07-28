import styled from "styled-components";

export const CategoriesTreeShell = styled.div`
  min-height: 0;

  .ant-tree {
    background: transparent;
  }

  .ant-tree-treenode {
    align-items: center;
    width: 100%;
    padding: 2px 0;
  }

  .ant-tree-switcher {
    display: none;
  }

  .ant-tree-node-content-wrapper {
    flex: 1;
    min-width: 0;
    padding: 0;
    border-radius: 6px;
  }

  .ant-tree-node-content-wrapper:hover,
  .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background: transparent;
  }

  .ant-tree-title {
    display: block;
    width: 100%;
  }

  @media (max-width: 767px) {
    .ant-tree-treenode {
      padding: 0;
    }

    .ant-tree-node-content-wrapper {
      border-radius: 0;
    }

    .ant-tree-indent-unit {
      width: 14px;
    }
  }
`;

export const CategoryRow = styled.div<{
  $clickable: boolean;
  $selected: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 8px;
  border-radius: 6px;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.functional.background.hover : "transparent"};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  &:hover,
  &:focus-within {
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  &:hover [data-category-actions],
  &:focus-within [data-category-actions] {
    opacity: 1;
    pointer-events: auto;
  }

  @media (max-width: 767px) {
    min-height: 52px;
    padding: 6px 8px;
    border-radius: 0;
  }
`;

export const CategoryCaret = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 16px;
  width: 16px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const CategoryIcon = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const CategoryName = styled.span<{ $hasChildren?: boolean }>`
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${({ $hasChildren }) => ($hasChildren ? 600 : 500)};

  @media (max-width: 767px) {
    overflow-wrap: anywhere;
    white-space: normal;
  }
`;

export const CategoryProductsCount = styled.span`
  flex: 0 0 auto;
  min-width: 44px;
  text-align: right;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};

  @media (max-width: 767px) {
    min-width: 32px;
  }
`;

export const CategoryActions = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;

  @media (max-width: 767px) {
    opacity: 1;
    pointer-events: auto;

    .ant-btn-sm {
      width: 36px;
      height: 36px;
      padding: 0;
    }
  }
`;

export const CategoryInlineRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 42px;
  padding: 4px 8px;

  .ant-input {
    min-width: 0;
    flex: 1 1 auto;
  }

  @media (max-width: 767px) {
    min-height: 52px;
    padding: 8px;
  }

  @media (max-width: 420px) {
    flex-wrap: wrap;

    .ant-input {
      flex-basis: 100%;
    }
  }
`;
