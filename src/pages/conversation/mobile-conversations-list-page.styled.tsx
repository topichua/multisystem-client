import { Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("conversations-mobile-list-page"),
)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const GroupChipsScroll = styled.div.attrs(() =>
  dataQaAttrs("conversations-mobile-group-filters"),
)`
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
`;

export const GroupChips = styled.div`
  width: max-content;
  min-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const GroupChip = styled.button<{ $selected: boolean }>`
  appearance: none;
  min-width: 0;
  height: 36px;
  margin: 0;
  padding: 0 10px;
  border: 1px solid
    ${({ $selected, theme }) =>
      $selected
        ? theme.colors.functional.border.selected
        : theme.colors.functional.border.cardBase};
  border-radius: 999px;
  background: ${({ $selected, theme }) =>
    $selected
      ? theme.colors.functional.background.active
      : theme.colors.functional.background.elevated};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const GroupDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

export const GroupName = styled.span`
  min-width: 0;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const GroupCount = styled(Typography.Text)`
  && {
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1;
  }
`;
