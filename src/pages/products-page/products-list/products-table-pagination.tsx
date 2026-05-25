import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';

import {
  PaginationBar,
  PaginationSummary,
  StyledPaginationWrap,
} from './products-table-pagination.styled';

type ProductsTablePaginationProps = {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
};

export const ProductsTablePagination = ({
  current,
  pageSize,
  total,
  onChange,
}: ProductsTablePaginationProps) => {
  const { t } = useTranslation();

  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);

  return (
    <PaginationBar>
      <PaginationSummary>{t('products.pagination.summary', { from, to, total })}</PaginationSummary>
      {total > 0 ? (
        <StyledPaginationWrap>
          <Pagination
            current={current}
            total={total}
            pageSize={pageSize}
            showSizeChanger={false}
            hideOnSinglePage={false}
            onChange={onChange}
          />
        </StyledPaginationWrap>
      ) : null}
    </PaginationBar>
  );
};
