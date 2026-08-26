import styled, { css } from "styled-components";

const groupRowLayout = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  text-align: left;
  user-select: none;
`;

export const GroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
`;

export const GroupNavButton = styled.button<{ $selected: boolean }>`
  ${groupRowLayout};
  color: ${(props) =>
    props.$selected
      ? props.theme.colors.functional.text.heading
      : props.theme.colors.functional.text.subdued};
  background: ${(props) =>
    props.$selected
      ? props.theme.colors.functional.background.active
      : "transparent"};
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: ${(props) =>
      props.$selected
        ? props.theme.colors.functional.background.active
        : props.theme.colors.functional.background.hover};
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px
      ${(props) => props.theme.colors.functional.border.selected};
  }
`;

export const GroupStaticRow = styled.div`
  ${groupRowLayout};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  background: transparent;
`;

export const GroupIdentity = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`;

export const GroupDot = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

export const GroupIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
`;

export const GroupName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
`;

export const GroupCount = styled.span`
  min-width: 31px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  background: ${(props) => props.theme.colors.functional.background.elevated};
`;

export const GroupListDivider = styled.div`
  height: 1px;
  margin: 8px 0 2px;
  background: ${(props) => props.theme.colors.functional.border.cardBase};
`;
