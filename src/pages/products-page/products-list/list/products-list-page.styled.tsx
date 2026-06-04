import styled from "styled-components";

export const ProductsTableWrapper = styled.div`
  --products-expanded-row-bg: #fafafa;

  .ant-table-tbody > tr.product-row-expanded > td {
    border-bottom: none;
    background: var(--products-expanded-row-bg);
  }

  .ant-table-tbody > tr.product-row-expanded.ant-table-row:hover > td {
    background: var(--products-expanded-row-bg);
  }

  .ant-table-tbody > tr.ant-table-expanded-row > td {
    background: var(--products-expanded-row-bg);
    padding-top: 0;
  }

  .ant-table-tbody > tr.ant-table-expanded-row:hover > td {
    background: var(--products-expanded-row-bg);
  }
`;
