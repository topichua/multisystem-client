import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const PageLayout = styled.main.attrs(() => dataQaAttrs("layout-app"))`
  box-sizing: border-box;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr);

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const WorkspaceLayout = styled.section.attrs(() =>
  dataQaAttrs("layout-workspace"),
)`
  box-sizing: border-box;
  background: transparent;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  min-width: 0;
  height: 100%;
  padding: 12px;
  overflow: hidden;

  & > * {
    min-height: 0;
  }

  @media (max-width: 767px) {
    padding-bottom: 76px;
  }
`;

export const MobileDock = styled.div.attrs(() =>
  dataQaAttrs("layout-mobile-dock"),
)`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    border-top: 1px solid
      ${({ theme }) => theme.colors.functional.border.cardBase};
    box-sizing: border-box;
  }
`;
