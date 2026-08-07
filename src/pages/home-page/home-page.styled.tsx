import styled from "styled-components";

import {
  DESKTOP_HEADER_HEIGHT,
  SIDER_WIDTH,
} from "@/app/layout/layout-constants";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const PageLayout = styled.main.attrs(() => dataQaAttrs("layout-app"))`
  box-sizing: border-box;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: ${SIDER_WIDTH} minmax(0, 1fr);
  grid-template-rows: ${DESKTOP_HEADER_HEIGHT} minmax(0, 1fr);
  background: ${({ theme }) => theme.colors.functional.background.appShell};

  & > * {
    min-height: 0;
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    height: 100dvh;
    max-height: 100dvh;
  }
`;

export const WorkspaceLayout = styled.section.attrs(() =>
  dataQaAttrs("layout-workspace"),
)`
  box-sizing: border-box;
  grid-column: 2;
  grid-row: 2;
  background: ${({ theme }) => theme.colors.functional.background.workspace};
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
  border-top: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 12px 0 0 0;

  & > * {
    min-height: 0;
  }

  @media (max-width: 767px) {
    grid-column: 1;
    grid-row: 2;
  }
`;
