import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

import { Grid as AnalyticsKpiGrid } from "../../components/analytics-kpi-cards.styled";

export const Grid = styled(AnalyticsKpiGrid).attrs(() =>
  dataQaAttrs("layout-analytics-customers-kpi-grid"),
)`
  grid-template-columns: repeat(6, minmax(0, 1fr));

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
