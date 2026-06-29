import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const PageLayout = styled.main.attrs(() => dataQaAttrs("layout-app"))`
  box-sizing: border-box;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);

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
  background: transparent;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  min-width: 0;
  height: 100%;
  overflow: hidden;

  & > * {
    min-height: 0;
  }
`;
