import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Aside = styled.aside.attrs(() =>
  dataQaAttrs("layout-conversations-groups"),
)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px;
  background: ${(props) => props.theme.colors.functional.background.base};
  border-right: 1px solid
    ${(props) => props.theme.colors.functional.border.cardBase};

  @media (max-width: 767px) {
    display: none;
  }
`;

export const CollapsedAside = styled.aside.attrs(() =>
  dataQaAttrs("layout-conversations-groups-collapsed"),
)`
  display: flex;
  justify-content: center;
  min-height: 0;
  padding: 12px;
  background: ${(props) => props.theme.colors.functional.background.base};
  border-right: 1px solid
    ${(props) => props.theme.colors.functional.border.cardBase};

  @media (max-width: 767px) {
    display: none;
  }
`;

export const Header = styled.header`
  flex-shrink: 0;
  padding: 0 0 18px;
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

export const GroupsScroll = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
`;

export const GroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const GroupFilterRow = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  color: ${(props) =>
    props.$selected
      ? props.theme.colors.functional.text.heading
      : props.theme.colors.functional.text.subdued};
  background: ${(props) =>
    props.$selected
      ? props.theme.colors.functional.background.active
      : "transparent"};
  cursor: pointer;
  user-select: none;
  text-align: left;

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
