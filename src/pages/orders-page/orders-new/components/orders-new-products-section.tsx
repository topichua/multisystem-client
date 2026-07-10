import { CubeIcon } from "@phosphor-icons/react";
import { Empty, Flex, Tag } from "antd";
import { useTranslation } from "react-i18next";

import { CatalogProductSearchPopover } from '@/features/products/components/catalog-product-search';
import type { useCatalogProductSearch } from '@/features/products/components/catalog-product-search';
import type { CatalogVariant } from "@/features/products/model/product.types";

import * as S from "../orders-new-page.styled";
import type { OrderNewLine } from "../orders-new.types";
import { OrdersNewProductLine } from "./orders-new-product-line";
import { SectionHeading } from './section-heading';

type OrdersNewProductsSectionProps = {
  catalogSearch: ReturnType<typeof useCatalogProductSearch>;
  onDiscountChange: (variantId: number, value: number | null) => void;
  onProductSearchOpenChange: (open: boolean) => void;
  onQuantityChange: (variantId: number, quantity: number) => void;
  onRemoveLine: (variantId: number) => void;
  onToggleDiscount: (variantId: number) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
  orderLines: OrderNewLine[];
  productSearchOpen: boolean;
  selectedVariantIds: Set<number>;
};

export function OrdersNewProductsSection({
  catalogSearch,
  onDiscountChange,
  onProductSearchOpenChange,
  onQuantityChange,
  onRemoveLine,
  onToggleDiscount,
  onVariantSelect,
  orderLines,
  productSearchOpen,
  selectedVariantIds,
}: OrdersNewProductsSectionProps) {
  const { t } = useTranslation();
  const hasOrderLines = orderLines.length > 0;

  return (
    <S.SectionCard>
      <S.CardHeader
        justify="space-between"
        align="center"
        gap={12}
        style={{ marginBottom: hasOrderLines ? 0 : 18 }}
      >
        <SectionHeading icon={<CubeIcon size={18} />}>
          <Flex align="center" gap={8}>
            {t('orders.create.products.title')}
            <Tag>{orderLines.length}</Tag>
          </Flex>
        </SectionHeading>

        <CatalogProductSearchPopover
          open={productSearchOpen}
          buttonLabel={t('orders.create.products.add')}
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
          onOpenChange={onProductSearchOpenChange}
          onSearch={catalogSearch.handleSearch}
          onSearchModeChange={catalogSearch.handleSearchModeChange}
          onVariantSelect={onVariantSelect}
        />
      </S.CardHeader>

      {hasOrderLines ? (
        <S.ProductLines>
          {orderLines.map((line) => (
            <OrdersNewProductLine
              key={line.variantId}
              line={line}
              onDiscountChange={onDiscountChange}
              onQuantityChange={onQuantityChange}
              onRemove={onRemoveLine}
              onToggleDiscount={onToggleDiscount}
            />
          ))}
        </S.ProductLines>
      ) : (
        <Empty
          image={<CubeIcon size={28} />}
          description={t('orders.create.products.emptyState')}
        />
      )}
    </S.SectionCard>
  );
}
