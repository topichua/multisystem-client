import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const ANALYTICS_CONTENT_MAX_WIDTH_PX = 1200;

export const Root = styled.div.attrs(() =>
  dataQaAttrs("layout-analytics-content"),
)`
  box-sizing: border-box;
  width: 100%;
  max-width: ${ANALYTICS_CONTENT_MAX_WIDTH_PX}px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ToolbarRow = styled.div.attrs(() =>
  dataQaAttrs("layout-analytics-content-toolbar"),
)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`;

export const Content = styled.div.attrs(() =>
  dataQaAttrs("layout-analytics-content-body"),
)`
  min-width: 0;
`;
