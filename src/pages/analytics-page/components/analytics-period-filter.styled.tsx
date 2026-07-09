import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("layout-analytics-period-filter"),
)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;

  @media (max-width: 767px) {
    justify-content: stretch;
  }
`;

export const Presets = styled.div`
  flex: 0 0 auto;

  @media (max-width: 767px) {
    width: 100%;
  }
`;

export const RangeField = styled.div`
  flex: 0 1 auto;
  min-width: 0;

  .ant-picker {
    width: 280px;
    max-width: 100%;
  }

  @media (max-width: 767px) {
    width: 100%;

    .ant-picker {
      width: 100%;
    }
  }
`;
