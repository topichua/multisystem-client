import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

import { Grid as AnalyticsKpiGrid } from "../../components/analytics-kpi-cards.styled";

export const Grid = styled(AnalyticsKpiGrid).attrs(() =>
  dataQaAttrs("layout-analytics-overview-kpi-grid"),
)<{ $columns?: number }>`
  grid-template-columns: repeat(
    ${({ $columns = 4 }) => $columns},
    minmax(0, 1fr)
  );

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
