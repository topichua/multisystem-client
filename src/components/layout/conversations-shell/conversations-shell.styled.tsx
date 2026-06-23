import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.section.attrs(() =>
  dataQaAttrs('layout-conversations-shell'),
)<{ $groupsCollapsed?: boolean; $listCollapsed?: boolean }>`
  background: transparent;
  display: grid;
  grid-template-columns: ${(props) =>
    `${props.$groupsCollapsed ? '48px' : '240px'} ${
      props.$listCollapsed ? '48px' : '320px'
    } minmax(0, 1fr)`};
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  margin: 0 12px 0 0;
  transition: grid-template-columns 0.16s ease;

  & > * {
    min-height: 0;
  }
  /* border: 1px solid ${(props) =>
    props.theme.colors.functional.border.cardBase}; */
  /* border-radius: ${(props) => props.theme.radius.semiLarge}; */
  /* box-shadow: ${(props) => props.theme.shadow.xl}; */
  background: ${(props) => props.theme.colors.functional.background.elevated};

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
    margin: 0 12px 0;
  }
`;

export const ListPane = styled.aside.attrs(() =>
  dataQaAttrs("layout-conversations-list"),
)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const ThreadPane = styled.main.attrs(() =>
  dataQaAttrs("layout-conversations-thread"),
)`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid
    ${(props) => props.theme.colors.functional.border.cardBase};

  @media (max-width: 767px) {
    border-left: none;
  }
`;
