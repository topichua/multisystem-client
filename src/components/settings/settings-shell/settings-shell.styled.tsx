import styled from "styled-components";

import {
  PaneScrollRegion,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.section.attrs(() => dataQaAttrs('layout-settings-shell'))`
  box-sizing: border-box;
  min-height: 0;
  min-width: 0;
  height: 100%;
  max-height: 100%;
  /* margin: 0 12px 0 0; */
  padding: 0;
  /* border: 1px solid ${(props) =>
    props.theme.colors.functional.border.cardBase}; */
  /* border-radius: ${(props) => props.theme.radius.semiLarge}; */
  background: ${(props) => props.theme.colors.functional.background.elevated};
  /* box-shadow: ${(props) => props.theme.shadow.xl}; */
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  overflow: hidden;

  @media (max-width: 767px) {
    margin: 0 12px 0;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
`;

export const Sidebar = styled.aside.attrs(() =>
  dataQaAttrs("layout-settings-sidebar"),
)<{ $customWidth?: number }>`
  box-sizing: border-box;
  width: ${({ $customWidth }) => $customWidth ?? 200}px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px 0 0;
  border-right: 1px solid
    ${(props) => props.theme.colors.functional.border.cardBase};

  @media (max-width: 767px) {
    border-right: none;
    border-bottom: 1px solid
      ${(props) => props.theme.colors.functional.border.cardBase};
    padding: 8px 0 0;
    width: auto;
  }
`;

export const Title = styled(PaneSectionTitle).attrs(() =>
  dataQaAttrs("layout-settings-sidebar-heading"),
)`
  flex-shrink: 0;
  padding: 0 16px 12px;
`;

export const SidebarScroll = styled(PaneScrollRegion).attrs(() =>
  dataQaAttrs("layout-settings-sidebar-scroll"),
)`
  padding: 0 0 16px;
`;

export const Content = styled(PaneScrollRegion).attrs(() =>
  dataQaAttrs("layout-settings-content"),
)`
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
