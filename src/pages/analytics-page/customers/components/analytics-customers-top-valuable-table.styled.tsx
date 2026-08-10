import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Section = styled.section.attrs(() =>
  dataQaAttrs("layout-analytics-customers-top-valuable-section"),
)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const TableWrap = styled.div`
  min-width: 0;

  .ant-table {
    background: transparent;
  }

  .ant-table-thead > tr > th {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: transparent;
  }

  .ant-table-tbody > tr > td {
    vertical-align: middle;
  }
`;
