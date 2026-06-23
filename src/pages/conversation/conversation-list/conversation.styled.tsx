import { Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

const { Title: AntdTitle } = Typography;

export const Conversation = styled.div.attrs(() =>
  dataQaAttrs("layout-conversations-list-body"),
)`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
`;

export const CollapsedColumn = styled.div.attrs(() =>
  dataQaAttrs("layout-conversations-list-collapsed"),
)`
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  padding: 12px;
  background: ${(props) => props.theme.colors.functional.background.base};
`;

export const HeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const CollapseButton = styled.button`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: ${(props) => props.theme.radius.medium};
  color: ${(props) => props.theme.colors.functional.text.subdued};
  background: transparent;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: ${(props) => props.theme.colors.functional.background.hover};
    color: ${(props) => props.theme.colors.functional.text.primary};
    outline: none;
  }
`;

export const ExpandButton = styled(CollapseButton)`
  margin-top: 0;
`;

export const ListItemPlaceholder = styled.div.attrs(() =>
  dataQaAttrs("layout-conversations-list-item-placeholder"),
)`
  flex: 1;
  min-height: 0;
  margin: 0 12px 12px;
  border-radius: 8px;
  background: transparent;
`;

export const ListScroll = styled.div.attrs(() =>
  dataQaAttrs("layout-conversations-list-scroll"),
)`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 16px;
`;

export const Title = styled(AntdTitle)`
  padding: 0 12px;
`;

export const FilterRow = styled.div`
  padding: 0 12px 10px;
`;

export const ConversationRow = styled.div<{
  $isSelected: boolean;
  $selectionColor: string;
}>`
  position: relative;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  padding: 8px 10px 8px 12px;
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.functional.background.hover : "transparent"};
  cursor: pointer;
  outline: none;
  transition: background 0.12s ease;

  &::before {
    content: "";
    position: absolute;
    inset-block: 8px;
    inset-inline-start: 0;
    width: 2px;
    background: ${({ $isSelected, $selectionColor }) =>
      $isSelected ? $selectionColor : "transparent"};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  &:focus-visible {
    outline: 2px solid ${({ $selectionColor }) => $selectionColor};
    outline-offset: 2px;
  }
`;

export const ConversationRowActions = styled.span`
  position: absolute;
  top: 8px;
  right: 10px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
`;

export const AvatarWithChannel = styled.span`
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
`;

export const ChannelBadge = styled.span`
  position: absolute;
  right: -5px;
  bottom: -5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.functional.background.base};
  pointer-events: none;
`;
