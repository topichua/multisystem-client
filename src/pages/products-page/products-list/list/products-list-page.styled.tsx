import { Typography } from "antd";
import styled, { css } from "styled-components";

export const ProductsTableWrapper = styled.div`
  .ant-table-cell {
    padding: 12px 12px !important;
  }

  --products-expanded-row-bg: ${({ theme }) =>
    theme.colors.functional.background.base};

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

  .ant-table-tbody > tr.product-row-archived {
    opacity: 0.5;
  }

  .ant-table-tbody > tr.product-row-archived > td {
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  .ant-table-tbody > tr.product-row-archived .ant-typography {
    color: ${({ theme }) => theme.colors.functional.text.subdued} !important;
  }
`;

const clickableBrandUnderlineCss = css`
  display: inline-block !important;
  width: fit-content !important;
  cursor: pointer;
  transition:
    color 0.15s ease,
    box-shadow 0.15s ease;
  padding-bottom: 1px;
  box-shadow: inset 0 -1px 0 0 transparent;

  &:hover {
    color: ${({ theme }) => theme.colors.functional.link.hover} !important;
    box-shadow: inset 0 -1px 0 0
      ${({ theme }) => theme.colors.functional.link.hover};
  }
`;

export const ProductNameLink = styled(Typography.Text)`
  && {
    max-width: 260px;
    ${clickableBrandUnderlineCss}
  }
`;

export const ProductNameMuted = styled(Typography.Text)`
  && {
    max-width: 260px;
    color: ${({ theme }) => theme.colors.functional.text.subdued} !important;
    cursor: not-allowed;
  }
`;

export const VariantMetaLink = styled(Typography.Text)`
  && {
    max-width: 100%;
    ${clickableBrandUnderlineCss}
  }
`;
