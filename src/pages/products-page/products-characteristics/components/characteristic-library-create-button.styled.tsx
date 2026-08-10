import styled from "styled-components";

export const PopupPanel = styled.div`
  width: 300px;
  max-height: 420px;
  overflow: auto;
  padding-block: 8px;
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  box-shadow: ${({ theme }) => theme.shadow.large};
`;

export const PopupHeader = styled.div`
  padding-inline: 16px;
  padding-block-end: 4px;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const PopupState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

export const PopupError = styled.div`
  padding: 16px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const LibraryTreeShell = styled.div`
  padding-inline: 4px;

  .ant-tree {
    background: transparent;
  }

  .ant-tree-treenode {
    align-items: center;
    width: 100%;
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

  .ant-tree-node-content-wrapper.ant-tree-node-disabled {
    cursor: default;
  }

  .ant-tree-title {
    display: block;
    width: 100%;
  }
`;

export const LibraryTreeRow = styled.div<{
  $clickable?: boolean;
  $disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 26px;
  padding: 0 8px;
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  cursor: ${({ $clickable, $disabled }) => {
    if ($disabled) {
      return "default";
    }

    return $clickable ? "pointer" : "default";
  }};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};

  &:hover,
  &:focus-within {
    background: ${({ $disabled, theme }) =>
      $disabled ? "transparent" : theme.colors.functional.background.hover};
  }

  &:hover [data-library-group-action],
  &:focus-within [data-library-group-action] {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const LibraryTreeCaret = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 16px;
  width: 16px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const LibraryTreeIcon = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  line-height: 1;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const LibraryTreeName = styled.span<{ $strong?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  font-weight: ${({ $strong }) => ($strong ? 600 : 500)};
`;

export const LibraryTreeLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LibraryTreeMeta = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  white-space: nowrap;
`;

export const LibraryTreeGroupAction = styled.span`
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;

  .ant-btn {
    height: auto;
    padding: 0;
    font-size: ${({ theme }) => theme.fontSize.small};
  }
`;

export const LibraryTreeExtra = styled.span`
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;
