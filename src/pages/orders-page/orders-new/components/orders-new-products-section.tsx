import { CubeIcon } from "@phosphor-icons/react";
import { Empty, Flex, Tag } from "antd";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";

import * as S from "../orders-new-page.styled";
import type { OrderNewLine } from "../orders-new.types";
import { OrdersNewProductLine } from "./orders-new-product-line";
import { SectionHeading } from "./section-heading";
import { ProductSearchPopover } from "./orders-new-products-section/product-search-popover";

type OrdersNewProductsSectionProps = {
  catalogSearchLoading: boolean;
  catalogSearchResults: CatalogVariant[];
  onDiscountChange: (variantId: number, value: number | null) => void;
  onProductSearchChange: (value: string) => void;
  onProductSearchClose: () => void;
  onProductSearchOpen: () => void;
  onQuantityChange: (variantId: number, quantity: number) => void;
  onRemoveLine: (variantId: number) => void;
  onToggleDiscount: (variantId: number) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
  orderLines: OrderNewLine[];
  productSearchOpen: boolean;
  productSearchValue: string;
  selectedVariantIds: Set<number>;
  trimmedProductSearch: string;
};

export function OrdersNewProductsSection({
  catalogSearchLoading,
  catalogSearchResults,
  onDiscountChange,
  onProductSearchChange,
  onProductSearchClose,
  onProductSearchOpen,
  onQuantityChange,
  onRemoveLine,
  onToggleDiscount,
  onVariantSelect,
  orderLines,
  productSearchOpen,
  productSearchValue,
  selectedVariantIds,
  trimmedProductSearch,
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
            {t("orders.create.products.title")}
            <Tag>{orderLines.length}</Tag>
          </Flex>
        </SectionHeading>

        <ProductSearchPopover
          open={productSearchOpen}
          value={productSearchValue}
          loading={catalogSearchLoading}
          results={catalogSearchResults}
          selectedVariantIds={selectedVariantIds}
          trimmedSearch={trimmedProductSearch}
          onOpen={onProductSearchOpen}
          onClose={onProductSearchClose}
          onChange={onProductSearchChange}
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
          description={t("orders.create.products.emptyState")}
        />
      )}
    </S.SectionCard>
  );
}
