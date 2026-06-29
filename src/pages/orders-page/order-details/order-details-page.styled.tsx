import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const PageRoot = styled.div.attrs(() =>
  dataQaAttrs("orders-mobile-detail-page"),
)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  & > * {
    width: 100%;
    min-width: 0;
  }

  .ant-spin-nested-loading,
  .ant-spin-container {
    width: 100%;
    min-width: 0;
  }
`;
