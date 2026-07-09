import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const ReportsStack = styled.div.attrs(() =>
  dataQaAttrs("layout-analytics-overview-reports"),
)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
`;
