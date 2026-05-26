import styled from "styled-components";

import { BRAND_PRIMARY } from "@/styled/brand";

export const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 16px;
`;

export const PaginationSummary = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

const activeBg = "rgba(114, 46, 209, 0.08)";

export const StyledPaginationWrap = styled.div`
  .ant-pagination {
    margin: 0;
  }

  .ant-pagination-item,
  .ant-pagination-prev .ant-pagination-item-link,
  .ant-pagination-next .ant-pagination-item-link {
    border-radius: 8px;
    min-width: 36px;
    height: 36px;
    line-height: 34px;
    border-color: ${({ theme }) => theme.colors.functional.border.split};
    background: ${({ theme }) => theme.colors.functional.background.base};
  }

  .ant-pagination-item a {
    color: ${({ theme }) => theme.colors.functional.text.primary};
  }

  .ant-pagination-item-active {
    border-color: ${BRAND_PRIMARY};
    background-color: ${activeBg};
    font-weight: 600;
  }

  .ant-pagination-item-active a {
    color: ${BRAND_PRIMARY};
  }

  .ant-pagination-item-active:hover {
    border-color: ${BRAND_PRIMARY};
    background-color: ${activeBg};
  }

  .ant-pagination-item-active:hover a {
    color: ${BRAND_PRIMARY};
  }

  .ant-pagination-disabled .ant-pagination-item-link {
    opacity: 0.45;
  }
`;
