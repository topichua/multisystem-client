import type { ColumnsType } from 'antd/es/table';
import type { TableProps } from 'antd';
import { PlusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import {
  AddVariantButton,
  VariantsHeader,
  VariantsSection,
  VariantsTable,
  VariantsTitle,
} from './product-detail.styled';

type ProductVariantsListSectionProps<T> = {
  count: number;
  dataSource: T[];
  columns: ColumnsType<T>;
  rowKey: keyof T;
  variantSaveLoading: boolean;
  onAddVariant: () => void;
  tableScroll?: TableProps['scroll'];
};

export function ProductVariantsListSection<T extends object>({
  count,
  dataSource,
  columns,
  rowKey,
  variantSaveLoading,
  onAddVariant,
  tableScroll,
}: ProductVariantsListSectionProps<T>) {
  const { t } = useTranslation();

  return (
    <VariantsSection>
      <VariantsHeader>
        <VariantsTitle>
          {t('products.variantsTitle')} ({count})
        </VariantsTitle>
        <AddVariantButton type="button" disabled={variantSaveLoading} onClick={onAddVariant}>
          <PlusIcon size={18} weight="bold" />
          {t('products.variantAddCta')}
        </AddVariantButton>
      </VariantsHeader>
      <VariantsTable
        rowKey={(record) => String((record as Record<string, unknown>)[rowKey as string])}
        size="small"
        pagination={false}
        dataSource={dataSource as Record<string, unknown>[]}
        columns={columns as ColumnsType<unknown>}
        scroll={tableScroll ?? { x: 'max-content', y: 280 }}
      />
    </VariantsSection>
  );
}
