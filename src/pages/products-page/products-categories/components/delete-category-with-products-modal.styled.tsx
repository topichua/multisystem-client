import { Tree } from "antd";
import styled from "styled-components";

export const NoCategoryOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.functional.background.active : "transparent"};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};
  text-align: left;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ $selected, theme }) =>
      $selected
        ? theme.colors.functional.background.active
        : theme.colors.functional.background.hover};
  }
`;

export const NoCategoryOptionContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;

export const NoCategoryOptionIcon = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const NoCategoryOptionCheck = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.semantic.primary};
`;

export const TargetTreeShell = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 8px;
  max-height: 220px;
  min-height: 220px;
  overflow: auto;
  padding: 8px;

  @media (max-width: 767px) {
    max-height: 40dvh;
    min-height: 180px;
  }
`;

export const TargetTree = styled(Tree)`
  .ant-tree-switcher {
    display: none;
  }
`;
