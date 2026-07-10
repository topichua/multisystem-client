import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { OrderDraftLine } from '@/features/orders/model/order.types';
import {
  CatalogProductSearchPicker,
  type useCatalogProductSearch,
} from '@/features/products/components/catalog-product-search';
import type { CatalogVariant } from '@/features/products/model/product.types';

import * as S from './client-order-drawer.styled';
import { ClientOrderLinesTable } from './client-order-lines-table';
import { Flex } from 'antd';

type ClientOrderProductsSectionProps = {
  catalogSearch: ReturnType<typeof useCatalogProductSearch>;
  orderLines: OrderDraftLine[];
  selectedVariantIds: Set<number>;
  title: ReactNode;
  onQuantityChange: (variantId: number, quantity: number) => void;
  onRemoveLine: (variantId: number) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
};

export function ClientOrderProductsSection({
  catalogSearch,
  orderLines,
  selectedVariantIds,
  title,
  onQuantityChange,
  onRemoveLine,
  onVariantSelect,
}: ClientOrderProductsSectionProps) {
  const { t } = useTranslation();

  return (
    <S.Section>
      <S.SectionHeader>
        {title}
        <S.SectionCount>
          {t('conversation.clientOrders.drawer.selectedCount', {
            count: orderLines.length,
          })}
        </S.SectionCount>
      </S.SectionHeader>

      <Flex vertical gap={12}>
        <CatalogProductSearchPicker
          showAddLabel
          addLabel={t('conversation.clientOrders.drawer.addProductDivider')}
          catalogSearchLoading={catalogSearch.catalogSearchLoading}
          catalogSearchMode={catalogSearch.catalogSearchMode}
          catalogSearchProductGroups={catalogSearch.catalogSearchProductGroups}
          categoriesLoading={catalogSearch.categoriesLoading}
          categorySelectOptions={catalogSearch.categorySelectOptions}
          minSearchLength={catalogSearch.minSearchLength}
          productPickerKey={catalogSearch.productPickerKey}
          selectedCategoryId={catalogSearch.selectedCategoryId}
          selectedVariantIds={selectedVariantIds}
          trimmedSearch={catalogSearch.trimmedSearch}
          variantSelectOptions={catalogSearch.variantSelectOptions}
          onCategoryChange={catalogSearch.handleCategoryChange}
          onClear={catalogSearch.handleClear}
          onSearch={catalogSearch.handleSearch}
          onSearchModeChange={catalogSearch.handleSearchModeChange}
          onVariantSelect={onVariantSelect}
        />

        <ClientOrderLinesTable
          orderLines={orderLines}
          onQuantityChange={onQuantityChange}
          onRemove={onRemoveLine}
        />
      </Flex>
    </S.Section>
  );
}
